import PDFDocument from 'pdfkit';
import { pdfDate } from './finance-pdf.js';

const INK = '#1a2330';
const MUTED = '#5f6b76';
const LINE = '#d9dee5';
const LINE_SOFT = '#e8ecf1';
const BAND = '#f5f7f9';
const HEADER_BG = '#eef1f5';
const ACCENT = '#243447';
const SOFT = '#f0f3f6';

const PACK_LABELS = {
  full: 'Informe institucional completo',
  profile: 'Perfil del establecimiento',
  banking: 'Cuenta bancaria de origen',
  staff: 'Nómina de personal',
  teachers: 'Cuerpo docente',
  accounts: 'Cuentas de la plataforma',
  jobs: 'Cargos y jerarquías',
  courses: 'Cursos y asignaturas',
};

const ROLE_LABELS = {
  director: 'Director/a',
  manager: 'Manager',
  monitor: 'Monitor/a',
  school_admin: 'Administrador/a',
  super_admin: 'Super administrador/a',
  utp: 'Jefe/a de UTP',
  inspector: 'Inspector/a',
  warehouse: 'Bodega',
  agente_finanzas: 'Agente de finanzas',
  finance: 'Finanzas',
  teacher: 'Profesor/a',
  guardian: 'Apoderado/a',
  student: 'Estudiante',
};

const SCHOOL_TYPE = {
  subvencionado: 'Subvencionado',
  particular: 'Particular',
  publico: 'Público',
};

const ACCOUNT_TYPE = {
  corriente: 'Corriente',
  vista: 'Vista',
  ahorro: 'Ahorro',
  rut: 'RUT',
};

/** Listados anchos e informe completo en horizontal; perfil/banca/cargos en vertical. */
const WIDE_PACKS = new Set(['full', 'staff', 'teachers', 'accounts', 'courses']);

function filenamePart(value) {
  return String(value || 'colegio')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'colegio';
}

function pageBox(doc) {
  return {
    left: doc.page.margins.left,
    right: doc.page.width - doc.page.margins.right,
    top: doc.page.margins.top,
    bottom: doc.page.height - doc.page.margins.bottom,
    usable: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  };
}

function ensureSpace(doc, needed = 80) {
  const { bottom } = pageBox(doc);
  if (doc.y + needed <= bottom) return false;
  doc.addPage();
  return true;
}

function include(pack, key) {
  return pack === 'full' || pack === key;
}

function createDoc(pack, school) {
  const landscape = WIDE_PACKS.has(pack);
  return new PDFDocument({
    size: 'A4',
    layout: landscape ? 'landscape' : 'portrait',
    bufferPages: true,
    margins: landscape
      ? { top: 40, bottom: 44, left: 36, right: 36 }
      : { top: 44, bottom: 48, left: 48, right: 48 },
    info: {
      Title: schoolInfoPackLabel(pack),
      Author: school?.name || 'DashCole',
      Creator: 'DashCole',
    },
  });
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());
}

function drawHeader(doc, { title, school, banking, generatedBy }) {
  const { left, usable, right } = pageBox(doc);

  doc.save();
  doc.rect(0, 0, doc.page.width, 4).fill(ACCENT);
  doc.restore();

  let y = 18;
  doc.fillColor(MUTED).font('Helvetica').fontSize(8)
    .text('DashCole · Documento interno del establecimiento', left, y, { width: usable * 0.58 });
  doc.fillColor(MUTED).fontSize(8)
    .text(new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(new Date()), left + usable * 0.58, y, {
      width: usable * 0.42,
      align: 'right',
    });
  y += 18;

  doc.fillColor(INK).font('Helvetica-Bold').fontSize(16)
    .text(school?.name || 'Establecimiento educacional', left, y, { width: usable });
  y = doc.y + 6;

  const metaParts = [
    school?.rbd ? `RBD ${school.rbd}` : null,
    school?.city || null,
    (banking?.companyRut || school?.companyRut) ? `RUT ${banking?.companyRut || school?.companyRut}` : null,
    SCHOOL_TYPE[school?.schoolType] || null,
  ].filter(Boolean);
  if (metaParts.length) {
    doc.fillColor(MUTED).font('Helvetica').fontSize(9)
      .text(metaParts.join('   ·   '), left, y, { width: usable });
    y = doc.y + 4;
  }
  if (school?.address) {
    doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
      .text(school.address, left, y, { width: usable });
    y = doc.y + 8;
  } else {
    y += 6;
  }

  // Título del documento en franja gris
  const titleHeight = 34;
  doc.roundedRect(left, y, usable, titleHeight, 4).fill(HEADER_BG);
  doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(12)
    .text(title, left + 14, y + 10, { width: usable - 28 });
  y += titleHeight + 8;

  doc.fillColor(MUTED).font('Helvetica').fontSize(8)
    .text(
      `Generado por ${generatedBy || 'usuario'} · ${formatGeneratedAt()}`,
      left,
      y,
      { width: usable },
    );
  y = doc.y + 8;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.8).stroke();
  doc.y = y + 14;
}

function drawStatRow(doc, cards) {
  if (!cards.length) return;
  ensureSpace(doc, 58);
  const { left, usable } = pageBox(doc);
  const gap = 8;
  const columns = Math.min(cards.length, 4);
  const width = (usable - gap * (columns - 1)) / columns;
  const height = 46;
  const startY = doc.y;
  cards.forEach((card, index) => {
    const x = left + index * (width + gap);
    doc.roundedRect(x, startY, width, height, 4).fill(BAND);
    doc.roundedRect(x, startY, width, height, 4).strokeColor(LINE).lineWidth(0.7).stroke();
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
      .text(String(card.label).toUpperCase(), x + 12, startY + 10, {
        width: width - 24,
        characterSpacing: 0.4,
      });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(15)
      .text(String(card.value), x + 12, startY + 24, { width: width - 24 });
  });
  doc.y = startY + height + 16;
}

function drawSectionTitle(doc, title) {
  ensureSpace(doc, 36);
  const { left, usable } = pageBox(doc);
  const y = doc.y;
  doc.rect(left, y, 3, 18).fill(ACCENT);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(11)
    .text(title, left + 12, y + 2, { width: usable - 12 });
  doc.y = y + 26;
}

function drawKeyValueGrid(doc, pairs) {
  const { left, usable } = pageBox(doc);
  const gap = 14;
  const colWidth = (usable - gap) / 2;
  let index = 0;
  while (index < pairs.length) {
    ensureSpace(doc, 40);
    const y = doc.y;
    let rowHeight = 36;
    doc.font('Helvetica-Bold').fontSize(10);
    for (let col = 0; col < 2 && index + col < pairs.length; col += 1) {
      const pair = pairs[index + col];
      const value = String(pair.value || '—');
      const h = 18 + doc.heightOfString(value, { width: colWidth - 8 });
      if (h > rowHeight) rowHeight = Math.min(h, 52);
    }
    for (let col = 0; col < 2 && index < pairs.length; col += 1, index += 1) {
      const pair = pairs[index];
      const x = left + col * (colWidth + gap);
      doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
        .text(String(pair.label).toUpperCase(), x, y, {
          width: colWidth,
          characterSpacing: 0.3,
        });
      doc.fillColor(INK).font('Helvetica-Bold').fontSize(10)
        .text(String(pair.value || '—'), x, y + 12, { width: colWidth });
      doc.moveTo(x, y + rowHeight - 4).lineTo(x + colWidth, y + rowHeight - 4)
        .strokeColor(LINE_SOFT).lineWidth(0.6).stroke();
    }
    doc.y = y + rowHeight + 6;
  }
  doc.y += 6;
}

function measureRowHeight(doc, columns, row, minHeight = 26) {
  let tallest = minHeight;
  columns.forEach((column, colIndex) => {
    const text = String(row[colIndex] ?? '—');
    const height = doc.heightOfString(text, {
      width: Math.max(14, column.width - 14),
      align: column.align || 'left',
    }) + 14;
    if (height > tallest) tallest = height;
  });
  return Math.min(Math.max(tallest, minHeight), 72);
}

function drawTable(doc, columns, rows, { emptyText = 'Sin registros.' } = {}) {
  const { left, usable, bottom } = pageBox(doc);
  const totalWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const scale = totalWidth > 0 ? usable / totalWidth : 1;
  const scaled = columns.map((column) => ({ ...column, width: column.width * scale }));
  const headHeight = 28;

  const drawHead = () => {
    ensureSpace(doc, 44);
    let x = left;
    const y = doc.y;
    doc.rect(left, y, usable, headHeight).fill(ACCENT);
    scaled.forEach((column) => {
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
        .text(String(column.label).toUpperCase(), x + 8, y + 9, {
          width: column.width - 16,
          align: column.align || 'left',
          lineBreak: false,
          characterSpacing: 0.25,
        });
      x += column.width;
    });
    doc.y = y + headHeight;
  };

  drawHead();
  if (!rows.length) {
    const y = doc.y;
    doc.rect(left, y, usable, 36).fill(BAND);
    doc.fillColor(MUTED).font('Helvetica').fontSize(9)
      .text(emptyText, left + 12, y + 12, { width: usable - 24 });
    doc.y = y + 48;
    return;
  }

  rows.forEach((row, index) => {
    doc.font('Helvetica').fontSize(9);
    const rowHeight = measureRowHeight(doc, scaled, row);
    if (doc.y + rowHeight > bottom - 4) {
      doc.addPage();
      drawHead();
    }
    const y = doc.y;
    if (index % 2 === 1) doc.rect(left, y, usable, rowHeight).fill(BAND);
    doc.moveTo(left, y + rowHeight).lineTo(left + usable, y + rowHeight)
      .strokeColor(LINE_SOFT).lineWidth(0.5).stroke();
    let x = left;
    scaled.forEach((column, colIndex) => {
      doc.fillColor(INK).font('Helvetica').fontSize(9)
        .text(String(row[colIndex] ?? '—'), x + 8, y + 7, {
          width: column.width - 16,
          align: column.align || 'left',
        });
      x += column.width;
    });
    doc.y = y + rowHeight;
  });

  // Borde inferior de cierre
  doc.moveTo(left, doc.y).lineTo(left + usable, doc.y)
    .strokeColor(LINE).lineWidth(0.8).stroke();
  doc.y += 16;
}

function drawNotice(doc, text) {
  ensureSpace(doc, 42);
  const { left, usable } = pageBox(doc);
  const y = doc.y;
  const height = Math.max(34, doc.heightOfString(text, { width: usable - 28 }) + 16);
  doc.roundedRect(left, y, usable, height, 4).fill(SOFT);
  doc.roundedRect(left, y, usable, height, 4).strokeColor(LINE).lineWidth(0.6).stroke();
  doc.rect(left, y, 3, height).fill(MUTED);
  doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
    .text(text, left + 14, y + 9, { width: usable - 28 });
  doc.y = y + height + 14;
}

function drawSignatures(doc, { names = [], slots = [] } = {}) {
  ensureSpace(doc, 120);
  const { left, usable } = pageBox(doc);
  const entries = slots.length
    ? slots
    : (names.length ? names : ['Director/a del establecimiento', 'Secretaría / Administración'])
      .map((label) => (typeof label === 'string' ? { label } : label));
  const gap = 28;
  const width = (usable - gap * (entries.length - 1)) / entries.length;

  doc.fillColor(MUTED).font('Helvetica').fontSize(8)
    .text('VALIDACIÓN', left, doc.y, { characterSpacing: 0.6 });
  doc.y += 10;

  const y = doc.y + 48;
  entries.forEach((entry, index) => {
    const label = entry.label || entry.title || 'Firma';
    const signerName = entry.signerName || entry.fullName || '';
    const imagePath = entry.imagePath || entry.signaturePath || '';
    const x = left + index * (width + gap);
    if (imagePath) {
      try {
        doc.image(imagePath, x + 12, y - 40, { fit: [width - 24, 36], align: 'center', valign: 'bottom' });
      } catch {
        if (signerName) {
          doc.fillColor(INK).font('Helvetica-Oblique').fontSize(10)
            .text(signerName, x + 8, y - 24, { width: width - 16, align: 'center' });
        }
      }
    } else if (signerName) {
      doc.fillColor(INK).font('Helvetica-Oblique').fontSize(10)
        .text(signerName, x + 8, y - 24, { width: width - 16, align: 'center' });
    }
    doc.moveTo(x + 8, y).lineTo(x + width - 8, y).strokeColor(LINE).lineWidth(1).stroke();
    doc.fillColor(INK).font('Helvetica').fontSize(9)
      .text(label, x, y + 10, { width, align: 'center' });
    doc.fillColor(MUTED).fontSize(7.5)
      .text((signerName || imagePath) ? 'Firma digital del perfil' : 'Nombre, firma y timbre', x, y + 24, { width, align: 'center' });
  });
  doc.y = y + 48;
}

function drawFooter(doc) {
  ensureSpace(doc, 36);
  const { left, usable } = pageBox(doc);
  doc.moveTo(left, doc.y).lineTo(left + usable, doc.y).strokeColor(LINE).lineWidth(0.8).stroke();
  doc.y += 10;
  doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).text(
    'Documento institucional generado en DashCole para respaldo administrativo. Contiene información sensible; circule solo entre personal autorizado. No sustituye declaraciones oficiales ante MINEDUC ni la Superintendencia de Educación.',
    left,
    doc.y,
    { width: usable },
  );
}

function addPageNumbers(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(range.start + i);
    const { left, usable } = {
      left: doc.page.margins.left,
      usable: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    };
    const y = doc.page.height - 26;
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
      .text('DashCole', left, y, { width: usable * 0.4, lineBreak: false });
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
      .text(`Página ${i + 1} de ${range.count}`, left, y, {
        width: usable,
        align: 'right',
        lineBreak: false,
      });
  }
}

export function schoolInfoPackLabel(pack) {
  return PACK_LABELS[pack] || PACK_LABELS.full;
}

export function schoolInfoFilename(schoolName, pack) {
  return `informacion-${filenamePart(schoolName)}-${filenamePart(pack)}.pdf`;
}

export function streamSchoolInfoPdf(res, {
  pack = 'full',
  school,
  banking,
  stages = [],
  employees = [],
  teachers = [],
  accounts = [],
  jobTitles = [],
  courses = [],
  counts = {},
  generatedBy,
  signatureSlots = null,
}) {
  const title = schoolInfoPackLabel(pack);
  const doc = createDoc(pack, school);
  doc.pipe(res);

  drawHeader(doc, { title, school, banking, generatedBy, pack });

  if (pack === 'full') {
    drawStatRow(doc, [
      { label: 'Personal activo', value: String(counts.employees ?? employees.length) },
      { label: 'Docentes', value: String(counts.teachers ?? teachers.length) },
      { label: 'Cuentas', value: String(counts.accounts ?? accounts.length) },
      { label: 'Cursos', value: String(counts.courses ?? courses.length) },
    ]);
  } else if (pack === 'staff') {
    drawStatRow(doc, [{ label: 'Personal activo', value: String(counts.employees ?? employees.length) }]);
  } else if (pack === 'teachers') {
    drawStatRow(doc, [{ label: 'Docentes', value: String(counts.teachers ?? teachers.length) }]);
  } else if (pack === 'accounts') {
    drawStatRow(doc, [{ label: 'Cuentas', value: String(counts.accounts ?? accounts.length) }]);
  } else if (pack === 'courses') {
    drawStatRow(doc, [{ label: 'Cursos / asignaturas', value: String(counts.courses ?? courses.length) }]);
  } else if (pack === 'jobs') {
    drawStatRow(doc, [{ label: 'Cargos', value: String(jobTitles.length) }]);
  }

  if (include(pack, 'profile')) {
    drawSectionTitle(doc, pack === 'full' ? '1. Perfil del establecimiento' : 'Perfil del establecimiento');
    drawKeyValueGrid(doc, [
      { label: 'Nombre', value: school?.name },
      { label: 'Identificador', value: school?.slug },
      { label: 'RBD MINEDUC', value: school?.rbd || 'Sin registrar' },
      { label: 'Ciudad', value: school?.city || 'Sin registrar' },
      { label: 'Tipo', value: SCHOOL_TYPE[school?.schoolType] || school?.schoolType || '—' },
      { label: 'Teléfono', value: school?.phone },
      { label: 'Correo', value: school?.email },
      { label: 'Sitio web', value: school?.website },
      { label: 'Dirección', value: school?.address },
    ]);
    if (stages.length) {
      drawSectionTitle(doc, 'Niveles educativos habilitados');
      drawTable(doc, [
        { label: 'Nivel', width: 2.4 },
        { label: 'Estado', width: 1 },
        { label: 'Cursos', width: 1, align: 'right' },
        { label: 'Grados', width: 1, align: 'right' },
      ], stages.map((stage) => [
        stage.name,
        stage.enabled ? 'Activo' : 'Inactivo',
        String(stage.courseCount ?? 0),
        String(stage.gradeCount ?? 0),
      ]), { emptyText: 'Sin niveles configurados.' });
    }
  }

  if (include(pack, 'banking')) {
    drawSectionTitle(doc, pack === 'full' ? '2. Cuenta bancaria de origen' : 'Cuenta bancaria de origen');
    drawKeyValueGrid(doc, [
      { label: 'Nombre empresa / sostenedor', value: banking?.companyName || school?.name },
      { label: 'RUT empresa', value: banking?.companyRut },
      { label: 'Banco origen', value: banking?.originBank },
      { label: 'Tipo de cuenta', value: ACCOUNT_TYPE[banking?.originAccountType] || banking?.originAccountType || '—' },
      { label: 'Número de cuenta', value: banking?.originAccountNumberMasked || (banking?.hasOriginAccountNumber ? 'Registrada (parcial)' : 'Sin registrar') },
      { label: 'Uso', value: 'Nómina, Previred y transferencias' },
    ]);
    drawNotice(doc, 'El número de cuenta se muestra enmascarado por seguridad. El valor completo permanece cifrado en el sistema.');
  }

  if (include(pack, 'jobs')) {
    drawSectionTitle(doc, pack === 'full' ? '3. Cargos institucionales' : 'Cargos institucionales');
    drawTable(doc, [
      { label: 'Cargo', width: 3 },
      { label: 'Jerarquía', width: 1, align: 'right' },
      { label: 'Empleados', width: 1.2, align: 'right' },
    ], jobTitles.map((row) => [
      row.name,
      row.hierarchy != null ? String(row.hierarchy) : '—',
      String(row.employeeCount ?? 0),
    ]), { emptyText: 'Sin cargos registrados.' });
  }

  if (include(pack, 'staff')) {
    drawSectionTitle(doc, pack === 'full' ? '4. Nómina de personal activo' : 'Nómina de personal activo');
    drawTable(doc, [
      { label: 'Nombre', width: 2.4 },
      { label: 'Cargo', width: 1.8 },
      { label: 'Contrato', width: 1.1 },
      { label: 'Ingreso', width: 1 },
      { label: 'Banco', width: 1.3 },
      { label: 'Cuenta', width: 1.3 },
    ], employees.map((row) => [
      row.fullName || '—',
      row.position || '—',
      row.contractType || '—',
      pdfDate(row.hiredOn),
      row.bank || '—',
      row.accountNumberMasked || '—',
    ]), { emptyText: 'Sin personal activo.' });
  }

  if (include(pack, 'teachers')) {
    drawSectionTitle(doc, pack === 'full' ? '5. Cuerpo docente' : 'Cuerpo docente');
    drawTable(doc, [
      { label: 'Nombre', width: 2.2 },
      { label: 'Usuario / correo', width: 2.4 },
      { label: 'Teléfono', width: 1.2 },
      { label: 'Estado', width: 1 },
    ], teachers.map((row) => [
      row.fullName || '—',
      row.username || '—',
      row.phone || '—',
      row.active === false ? 'Inactivo' : 'Activo',
    ]), { emptyText: 'Sin docentes registrados.' });
  }

  if (include(pack, 'accounts')) {
    drawSectionTitle(doc, pack === 'full' ? '6. Cuentas de la plataforma' : 'Cuentas de la plataforma');
    drawTable(doc, [
      { label: 'Nombre', width: 2.2 },
      { label: 'Usuario / correo', width: 2.2 },
      { label: 'Rol', width: 1.5 },
      { label: 'Estado', width: 1.1 },
    ], accounts.map((row) => [
      row.fullName || '—',
      row.username || '—',
      ROLE_LABELS[row.role] || row.role || '—',
      row.teamActive === false || row.active === false ? 'Sin acceso' : 'Activo',
    ]), { emptyText: 'Sin cuentas administrativas.' });
  }

  if (include(pack, 'courses')) {
    drawSectionTitle(doc, pack === 'full' ? '7. Cursos y asignaturas' : 'Cursos y asignaturas');
    drawTable(doc, [
      { label: 'Curso', width: 1.4 },
      { label: 'Sección', width: 0.8 },
      { label: 'Asignatura', width: 2.2 },
      { label: 'Docente', width: 2.2 },
      { label: 'Jefe de curso', width: 1.4 },
    ], courses.map((row) => [
      row.name || '—',
      row.section || '—',
      row.subject || '—',
      row.teacher || '—',
      row.headTeacher || '—',
    ]), { emptyText: 'Sin cursos registrados.' });
  }

  if (pack === 'full' || pack === 'profile' || pack === 'banking') {
    const defaultLabels = pack === 'banking'
      ? ['Director/a del establecimiento', 'Sostenedor/a o representante']
      : ['Director/a del establecimiento', 'Secretaría / Administración', 'Sostenedor/a o representante'];
    drawSignatures(doc, {
      slots: Array.isArray(signatureSlots) && signatureSlots.length
        ? signatureSlots
        : defaultLabels.map((label) => ({ label })),
    });
  }

  drawFooter(doc);
  addPageNumbers(doc);
  doc.end();
}

export const SCHOOL_INFO_PACKS = Object.keys(PACK_LABELS);
