import PDFDocument from 'pdfkit';

const INK = '#1f2a33';
const MUTED = '#5b6b76';
const LINE = '#c5d0d8';
const ACCENT = '#0b3a5b';

export function bankAccountPlainText(account = {}) {
  const lines = [
    'Cuenta corriente DashCole',
    'Datos para transferencia de suscripción',
    '',
    `Banco: ${account.bank || '—'}`,
    `Tipo de cuenta: ${account.accountType || '—'}`,
    `Número de cuenta: ${account.accountNumber || '—'}`,
    `Titular: ${account.holderName || '—'}`,
    `RUT: ${account.holderRut || '—'}`,
    `Correo: ${account.email || '—'}`,
    `Sucursal: ${account.branch || '—'}`,
  ];
  if (account.transferNote) {
    lines.push('', 'Nota para transferencias:', String(account.transferNote));
  }
  lines.push('', `Generado: ${new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}`);
  return `${lines.join('\n')}\n`;
}

export function streamBankAccountPdf(res, account = {}, { generatedBy = 'plataforma', signer = null } = {}) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 48, bottom: 48, left: 48, right: 48 },
    info: {
      Title: 'Cuenta corriente DashCole',
      Author: 'DashCole',
      Subject: 'Datos para transferencia de suscripción',
    },
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="cuenta-corriente-dashcole.pdf"');
  doc.pipe(res);

  const left = doc.page.margins.left;
  const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.rect(0, 0, doc.page.width, 84).fill(ACCENT);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18)
    .text('DashCole', left, 22, { width: usable });
  doc.font('Helvetica').fontSize(11)
    .text('Cuenta corriente para transferencias', left, 46, { width: usable });

  let y = 108;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(13)
    .text('Datos de la cuenta', left, y, { width: usable });
  y += 22;
  doc.moveTo(left, y).lineTo(left + usable, y).strokeColor(LINE).lineWidth(1).stroke();
  y += 16;

  const rows = [
    ['Banco', account.bank],
    ['Tipo de cuenta', account.accountType],
    ['Número de cuenta', account.accountNumber],
    ['Titular', account.holderName],
    ['RUT', account.holderRut],
    ['Correo', account.email],
    ['Sucursal', account.branch],
  ];

  rows.forEach(([label, value]) => {
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(label, left, y, { width: 140 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(11)
      .text(String(value || '—'), left + 150, y, { width: usable - 150 });
    y += 22;
  });

  if (account.transferNote) {
    y += 8;
    doc.moveTo(left, y).lineTo(left + usable, y).strokeColor(LINE).lineWidth(1).stroke();
    y += 16;
    doc.fillColor(MUTED).font('Helvetica').fontSize(9).text('Nota para transferencias', left, y, { width: usable });
    y += 16;
    doc.fillColor(INK).font('Helvetica').fontSize(10)
      .text(String(account.transferNote), left, y, { width: usable, lineGap: 3 });
    y = doc.y + 12;
  }

  const signatureBottom = doc.page.height - 150;
  y = Math.max(y + 36, signatureBottom);
  const slotWidth = Math.min(220, usable * 0.45);
  const imagePath = signer?.imagePath || '';
  const signerName = signer?.signerName || '';
  const signerLabel = signer?.label || 'Responsable plataforma';
  if (imagePath) {
    try {
      doc.image(imagePath, left + 8, y - 36, { fit: [slotWidth - 16, 34], align: 'center', valign: 'bottom' });
    } catch {
      if (signerName) {
        doc.fillColor(INK).font('Helvetica-Oblique').fontSize(11)
          .text(signerName, left + 8, y - 22, { width: slotWidth - 16, align: 'center' });
      }
    }
  } else if (signerName) {
    doc.fillColor(INK).font('Helvetica-Oblique').fontSize(11)
      .text(signerName, left + 8, y - 22, { width: slotWidth - 16, align: 'center' });
  }
  doc.moveTo(left + 8, y).lineTo(left + slotWidth - 8, y).strokeColor(LINE).lineWidth(1).stroke();
  doc.fillColor(MUTED).font('Helvetica').fontSize(8)
    .text(signerLabel, left, y + 8, { width: slotWidth, align: 'center' });
  doc.fillColor(MUTED).fontSize(7.5)
    .text((signerName || imagePath) ? 'Firma digital del perfil' : 'Firma', left, y + 20, { width: slotWidth, align: 'center' });

  y = Math.max(y + 48, doc.page.height - 56);
  doc.fillColor(MUTED).font('Helvetica').fontSize(8)
    .text(
      `Generado por ${generatedBy} · ${new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}`,
      left,
      y,
      { width: usable },
    );

  doc.end();
}
