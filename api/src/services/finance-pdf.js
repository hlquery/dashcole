import PDFDocument from 'pdfkit';

const INK = '#1f2a33';
const MUTED = '#5b6b76';
const LINE = '#c5d0d8';
const BAND = '#eef3f6';
const ACCENT = '#0b3a5b';

export function pdfCurrency(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function pdfDate(value) {
  if (!value) return '—';
  const raw = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return String(value);
  const [year, month, day] = raw.split('-');
  return `${day}-${month}-${year}`;
}

export function pdfPeriod(value) {
  const raw = String(value || '').slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(raw)) return String(value || '—');
  const [year, month] = raw.split('-');
  return `${month}-${year}`;
}

const invoiceStatusLabel = {
  pending: 'Pendiente',
  overdue: 'Vencido',
  paid: 'Pagado',
  cancelled: 'Anulado',
};

const paymentMethodLabel = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  debit: 'Débito',
  credit: 'Crédito',
};

export function labelInvoiceStatus(status) {
  return invoiceStatusLabel[status] || String(status || '—');
}

export function labelPaymentMethod(method) {
  return paymentMethodLabel[method] || String(method || '—');
}

function pageSize(doc) {
  return {
    width: doc.page.width,
    height: doc.page.height,
    left: doc.page.margins.left,
    right: doc.page.width - doc.page.margins.right,
    top: doc.page.margins.top,
    usable: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  };
}

function drawHeader(doc, {
  title,
  subtitle,
  school,
  year,
  generatedBy,
  orientation = 'portrait',
}) {
  const { left, right, usable, top } = pageSize(doc);
  doc.save();
  doc.rect(0, 0, doc.page.width, orientation === 'landscape' ? 78 : 92).fill(ACCENT);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
    .text('REPÚBLICA DE CHILE', left, 16, { width: usable, align: 'left' });
  doc.font('Helvetica').fontSize(8)
    .text('Ministerio de Educación · Superintendencia de Educación', left, 32, { width: usable });
  doc.font('Helvetica-Bold').fontSize(14).text(title, left, 48, { width: usable });
  doc.restore();

  let y = orientation === 'landscape' ? 92 : 108;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11).text(school?.name || 'Establecimiento educacional', left, y, { width: usable * 0.68 });
  doc.font('Helvetica').fontSize(8).fillColor(MUTED)
    .text(`Año de rendición: ${year}`, left + usable * 0.68, y, { width: usable * 0.32, align: 'right' });
  y += 16;

  const meta = [
    `RBD: ${school?.rbd || 'Sin registrar'}`,
    school?.companyRut ? `RUT sostenedor: ${school.companyRut}` : null,
    school?.schoolType ? `Tipo: ${schoolTypeLabel(school.schoolType)}` : null,
    school?.address || null,
  ].filter(Boolean).join('  ·  ');
  doc.fillColor(MUTED).fontSize(8).text(meta, left, y, { width: usable });
  y += 14;
  if (subtitle) {
    doc.fillColor(INK).font('Helvetica').fontSize(9).text(subtitle, left, y, { width: usable });
    y += 14;
  }
  doc.fillColor(MUTED).fontSize(7.5)
    .text(`Documento de apoyo institucional · Generado por ${generatedBy || 'usuario'} el ${new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}`, left, y, { width: usable });
  y += 18;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(1).stroke();
  doc.y = y + 12;
  return doc.y;
}

function schoolTypeLabel(type) {
  if (type === 'particular') return 'Particular';
  if (type === 'publico') return 'Público';
  return 'Subvencionado';
}

export function drawSummaryCards(doc, cards, { columns = 3 } = {}) {
  const { left, usable } = pageSize(doc);
  const gap = 10;
  const cardWidth = (usable - gap * (columns - 1)) / columns;
  const startY = doc.y;
  const height = 46;
  cards.forEach((card, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = left + col * (cardWidth + gap);
    const y = startY + row * (height + gap);
    doc.roundedRect(x, y, cardWidth, height, 4).fill(BAND);
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).text(String(card.label).toUpperCase(), x + 10, y + 9, { width: cardWidth - 20 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(12).text(String(card.value), x + 10, y + 22, { width: cardWidth - 20 });
  });
  const rows = Math.ceil(cards.length / columns);
  doc.y = startY + rows * (height + gap) + 4;
}

export function ensureSpace(doc, needed = 80) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed <= bottom) return;
  doc.addPage();
}

export function drawSectionTitle(doc, title) {
  ensureSpace(doc, 36);
  const { left, usable } = pageSize(doc);
  doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(10).text(title, left, doc.y, { width: usable });
  doc.y += 14;
}

export function drawTable(doc, columns, rows, { emptyText = 'Sin registros para el período.' } = {}) {
  const { left, usable } = pageSize(doc);
  const bottom = doc.page.height - doc.page.margins.bottom;
  const rowHeight = 18;
  const drawHead = () => {
    ensureSpace(doc, 40);
    let x = left;
    doc.rect(left, doc.y, usable, rowHeight).fill(ACCENT);
    columns.forEach((column) => {
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7)
        .text(column.label, x + 4, doc.y + 5, { width: column.width - 8, align: column.align || 'left', lineBreak: false, ellipsis: true });
      x += column.width;
    });
    doc.y += rowHeight;
  };
  drawHead();
  if (!rows.length) {
    doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(emptyText, left, doc.y + 6, { width: usable });
    doc.y += 24;
    return;
  }
  rows.forEach((row, index) => {
    if (doc.y + rowHeight > bottom) {
      doc.addPage();
      drawHead();
    }
    if (index % 2 === 1) doc.rect(left, doc.y, usable, rowHeight).fill(BAND);
    let x = left;
    columns.forEach((column, colIndex) => {
      doc.fillColor(INK).font('Helvetica').fontSize(7.2)
        .text(String(row[colIndex] ?? '—'), x + 4, doc.y + 5, {
          width: column.width - 8,
          align: column.align || 'left',
          lineBreak: false,
          ellipsis: true,
        });
      x += column.width;
    });
    doc.y += rowHeight;
  });
  doc.y += 8;
}

export function drawSignatures(doc, { names = [], slots = [] } = {}) {
  ensureSpace(doc, 100);
  const { left, usable } = pageSize(doc);
  doc.moveDown(0.6);
  const entries = slots.length
    ? slots
    : (names.length ? names : ['Director/a del establecimiento', 'Encargado/a de finanzas', 'Sostenedor/a o representante'])
      .map((label) => (typeof label === 'string' ? { label } : label));
  const gap = 16;
  const width = (usable - gap * (entries.length - 1)) / entries.length;
  const y = doc.y + 36;
  entries.forEach((entry, index) => {
    const label = entry.label || entry.title || entry.name || 'Firma';
    const signerName = entry.signerName || entry.fullName || '';
    const imagePath = entry.imagePath || entry.signaturePath || '';
    const x = left + index * (width + gap);
    if (imagePath) {
      try {
        doc.image(imagePath, x + 12, y - 34, { fit: [width - 24, 32], align: 'center', valign: 'bottom' });
      } catch {
        if (signerName) {
          doc.fillColor(INK).font('Helvetica-Oblique').fontSize(11)
            .text(signerName, x + 8, y - 22, { width: width - 16, align: 'center' });
        }
      }
    } else if (signerName) {
      doc.fillColor(INK).font('Helvetica-Oblique').fontSize(11)
        .text(signerName, x + 8, y - 22, { width: width - 16, align: 'center' });
    }
    doc.moveTo(x + 8, y).lineTo(x + width - 8, y).strokeColor(LINE).lineWidth(1).stroke();
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
      .text(label, x, y + 8, { width, align: 'center' });
    doc.fillColor(MUTED).fontSize(7).text('Firma y timbre', x, y + 20, { width, align: 'center' });
  });
  doc.y = y + 42;
}

export function drawFooterDisclaimer(doc) {
  ensureSpace(doc, 40);
  const { left, usable } = pageSize(doc);
  doc.moveTo(left, doc.y).lineTo(left + usable, doc.y).strokeColor(LINE).lineWidth(1).stroke();
  doc.y += 8;
  doc.fillColor(MUTED).font('Helvetica').fontSize(7).text(
    'Libro auxiliar de apoyo a la gestión del establecimiento. Facilita la preparación de antecedentes para la Rendición de Cuentas ante la Superintendencia de Educación (Portal de Transparencia Financiera) y el Ministerio de Educación. No sustituye la declaración oficial ni los libros electrónicos exigidos por la autoridad.',
    left,
    doc.y,
    { width: usable, align: 'left' },
  );
}

export function createInstitutionalPdf({ title, author, layout = 'portrait' }) {
  return new PDFDocument({
    size: 'A4',
    layout,
    margin: layout === 'landscape' ? 36 : 42,
    info: { Title: title, Author: author || 'DashCole', Creator: 'DashCole' },
  });
}

export function writeInstitutionalHeader(doc, options) {
  return drawHeader(doc, options);
}
