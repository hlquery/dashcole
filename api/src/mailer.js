import nodemailer from 'nodemailer';
import { getSmtpConfig } from './services/smtp-config.js';

async function createTransport() {
  const config = await getSmtpConfig();
  if (!config?.host) return null;
  return {
    transport: nodemailer.createTransport({
      host: config.host,
      port: Number(config.port || 587),
      secure: Boolean(config.secure),
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 8000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 8000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 12000),
      auth: config.user ? { user: config.user, pass: config.password || '' } : undefined,
    }),
    from: config.from || 'DashCole <no-reply@hlquery.com>',
  };
}

export async function sendGuardianWelcome({ email, guardianName, studentName, username, password, schoolName, messageId }) {
  const mail = await createTransport();
  if (!mail) return { sent: false, reason: 'SMTP no configurado' };
  await mail.transport.sendMail({
    messageId,
    from: mail.from,
    to: email,
    subject: `Acceso de apoderado a ${schoolName}`,
    text: [
      `Hola ${guardianName},`,
      '',
      `Se creó tu acceso de apoderado para consultar la información de ${studentName} en ${schoolName}.`,
      `Usuario o correo de acceso: ${username}`,
      `Contraseña temporal: ${password}`,
      '',
      'Por seguridad, cambia tu contraseña al ingresar.',
    ].join('\n'),
  });
  return { sent: true };
}

export async function sendUserWelcome({ email, fullName, password, schoolName, messageId }) {
  const mail = await createTransport();
  if (!mail) return { sent: false, reason: 'SMTP no configurado' };
  await mail.transport.sendMail({
    messageId,
    from: mail.from,
    to: email,
    subject: `Tu cuenta de acceso a ${schoolName}`,
    text: [
      `Hola ${fullName},`,
      '',
      `Se creó una cuenta para ti en la plataforma DashCole de ${schoolName}.`,
      `Correo de acceso: ${email}`,
      `Contraseña temporal: ${password}`,
      '',
      'Por seguridad, cambia tu contraseña después de ingresar.',
    ].join('\n'),
  });
  return { sent: true };
}

export async function sendAccessReset({ email, fullName, password, messageId }) {
  const mail = await createTransport();
  if (!mail) return { sent: false, reason: 'SMTP no configurado' };
  const name = String(fullName || '').trim() || 'hola';
  await mail.transport.sendMail({
    messageId,
    from: mail.from,
    to: email,
    subject: 'Tu acceso a DashCole fue restablecido',
    text: [
      `Hola ${name},`,
      '',
      'Un administrador de plataforma restableció tu acceso a DashCole.',
      `Correo de acceso: ${email}`,
      `Contraseña temporal: ${password}`,
      '',
      'Por seguridad, cambia tu contraseña al ingresar.',
      'Si no solicitaste este cambio, avisa de inmediato a tu colegio o a soporte.',
    ].join('\n'),
  });
  return { sent: true };
}

export async function sendPasswordForgot({ email, fullName, password, messageId }) {
  const mail = await createTransport();
  if (!mail) return { sent: false, reason: 'SMTP no configurado' };
  const name = String(fullName || '').trim() || 'hola';
  await mail.transport.sendMail({
    messageId,
    from: mail.from,
    to: email,
    subject: 'Recuperación de acceso a DashCole',
    text: [
      `Hola ${name},`,
      '',
      'Recibimos una solicitud para restablecer tu acceso a DashCole.',
      `Correo de acceso: ${email}`,
      `Contraseña temporal: ${password}`,
      '',
      'Ingresá con esta clave y cambiala desde tu perfil.',
      'Si no pediste este correo, avisá a dirección o a soporte de inmediato.',
    ].join('\n'),
  });
  return { sent: true };
}

function schoolFooter(school) {
  const lines = [
    school?.name,
    school?.phone ? `Teléfono: ${school.phone}` : '',
    school?.email ? `Correo: ${school.email}` : '',
    school?.website ? `Sitio web: ${school.website}` : '',
    school?.address ? `Dirección: ${school.address}` : '',
  ].filter(Boolean);
  return lines.length ? ['', '--', ...lines].join('\n') : '';
}

export async function sendCommunication({ emails, subject, body, school, messageId }) {
  const mail = await createTransport();
  if (!mail) throw new Error('SMTP no configurado. Configura el correo antes de enviar.');
  if (!emails.length) throw new Error('No hay destinatarios con correo válido.');
  await mail.transport.verify();
  const text = `${body}${schoolFooter(school)}`;
  let sent = 0;
  for (const email of emails) {
    try {
      const result = await mail.transport.sendMail({ messageId, from: mail.from, to: email, subject, text });
      if (result.rejected?.length || !result.accepted?.length) throw new Error('Destinatario rechazado');
      sent++;
    } catch {
      throw new Error(`Envío interrumpido: ${sent} de ${emails.length} correos aceptados. Revisa SMTP antes de reintentar para evitar duplicados.`);
    }
  }
  return { sent, total: emails.length };
}

export async function sendCitation({
  email,
  guardianName,
  studentName,
  schoolName,
  scheduledOn,
  scheduledTime,
  location,
  reason,
  school,
  messageId,
}) {
  const mail = await createTransport();
  if (!mail) return { sent: false, reason: 'SMTP no configurado' };
  const when = [scheduledOn, scheduledTime].filter(Boolean).join(' · ');
  await mail.transport.sendMail({
    messageId,
    from: mail.from,
    to: email,
    subject: `Citación a apoderado — ${schoolName || school?.name || 'Colegio'}`,
    text: [
      `Hola ${guardianName || 'apoderado/a'},`,
      '',
      `Has sido citado(a) a una reunión en ${schoolName || school?.name || 'el colegio'} respecto del estudiante ${studentName || '—'}.`,
      '',
      when ? `Fecha y hora: ${when}` : null,
      location ? `Lugar: ${location}` : null,
      '',
      'Motivo:',
      reason || 'Sin detalle adicional.',
      '',
      'Si no puedes asistir, contacta al colegio para reprogramar.',
      schoolFooter(school || { name: schoolName }),
    ].filter((line) => line !== null).join('\n'),
  });
  return { sent: true };
}
