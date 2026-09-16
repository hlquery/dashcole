import { controlModels, models, sequelize } from '../database.js';
import { ApiError } from '../http.js';
import { decryptSecret } from './secret-config.js';
import { databaseForTenant } from '../database-routing.js';

export async function whatsappConfig(schoolId, tenantModels = models) {
  const stored = await tenantModels.SchoolIntegration.findOne({ where: { schoolId, provider: 'whatsapp', active: true }, raw: true });
  if (stored) {
    const value = stored.config || {};
    const token = stored.encryptedSecret ? decryptSecret(stored.encryptedSecret) : '';
    const configured = Boolean(token) && /^\d+$/.test(value.phoneId || '') && /^v\d+\.\d+$/.test(value.version || '') && /^[a-z0-9_]+$/.test(value.template || '') && /^[a-z]{2}(?:_[A-Z]{2})?$/.test(value.language || '');
    return { configured, token, phoneId: value.phoneId, version: value.version, template: value.template, language: value.language };
  }
  const env = process.env;
  const configured = Number(env.WHATSAPP_SCHOOL_ID) === Number(schoolId) && Boolean(env.WHATSAPP_TOKEN) && /^\d+$/.test(env.WHATSAPP_PHONE_NUMBER_ID || '') && /^v\d+\.\d+$/.test(env.WHATSAPP_API_VERSION || '') && /^[a-z0-9_]+$/.test(env.WHATSAPP_TEMPLATE || '') && /^[a-z]{2}(?:_[A-Z]{2})?$/.test(env.WHATSAPP_LANGUAGE || '');
  return { configured, token: env.WHATSAPP_TOKEN, phoneId: env.WHATSAPP_PHONE_NUMBER_ID, version: env.WHATSAPP_API_VERSION, template: env.WHATSAPP_TEMPLATE, language: env.WHATSAPP_LANGUAGE };
}
export function templatePayload(config, recipient, subject, body) {
  return { messaging_product:'whatsapp', to:recipient.replace(/^\+/,''), type:'template', template:{ name:config.template, language:{code:config.language}, components:[{type:'body',parameters:[{type:'text',text:subject},{type:'text',text:body}]}] } };
}
export async function resolveStudentAudienceUsers(schoolId, studentId) {
  const student = await models.Student.findOne({
    where: { id: studentId, schoolId, active: true },
    attributes: ['id', 'userId', 'email', 'firstName', 'lastName'],
    raw: true,
  });
  if (!student) throw new ApiError(404, 'NOT_FOUND', 'Estudiante no encontrado.');
  const links = await models.StudentGuardian.findAll({ where: { studentId: student.id }, attributes: ['guardianId'], raw: true });
  const guardians = links.length
    ? await models.Guardian.findAll({ where: { id: links.map((row) => row.guardianId), schoolId }, attributes: ['id', 'userId', 'email', 'fullName'], raw: true })
    : [];
  const userIds = [...new Set([student.userId, ...guardians.map((row) => row.userId)].filter(Boolean))];
  const users = userIds.length
    ? await models.User.findAll({ where: { id: userIds, schoolId, active: true }, attributes: ['id', 'username', 'phone', 'whatsappOptIn', 'role'], raw: true })
    : [];
  return { student, guardians, users };
}

export async function resolveGuardianAudienceUser(schoolId, guardianId) {
  const guardian = await models.Guardian.findOne({
    where: { id: guardianId, schoolId },
    attributes: ['id', 'userId', 'email', 'fullName', 'phone'],
    raw: true,
  });
  if (!guardian) throw new ApiError(404, 'NOT_FOUND', 'Apoderado no encontrado.');
  const users = guardian.userId
    ? await models.User.findAll({ where: { id: guardian.userId, schoolId, active: true }, attributes: ['id', 'username', 'phone', 'whatsappOptIn', 'role'], raw: true })
    : [];
  return { guardian, users };
}

export async function queueWhatsApp(user, values) {
  const config = await whatsappConfig(user.schoolId);
  if (!config.configured) throw new ApiError(503,'WHATSAPP_UNAVAILABLE','Configura el token, teléfono, versión de API, idioma y plantilla de Meta para este colegio.');
  if (values.body.length > 900 || /[\r\n\t]/.test(values.subject + values.body)) throw new ApiError(400,'VALIDATION_ERROR','Para la plantilla WhatsApp, usa un mensaje de hasta 900 caracteres sin saltos de línea.');
  let recipients;
  if (values.audience === 'student') {
    const studentId = Number(values.targetStudentId);
    if (!Number.isInteger(studentId) || studentId < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona un estudiante.');
    const { users } = await resolveStudentAudienceUsers(user.schoolId, studentId);
    recipients = users.filter((row) => row.whatsappOptIn);
  } else if (values.audience === 'guardian') {
    const guardianId = Number(values.targetGuardianId);
    if (!Number.isInteger(guardianId) || guardianId < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona un apoderado.');
    const { users } = await resolveGuardianAudienceUser(user.schoolId, guardianId);
    recipients = users.filter((row) => row.whatsappOptIn);
  } else {
    const where = { schoolId:user.schoolId, active:true, whatsappOptIn:true };
    const roles = {students:'student',guardians:'guardian',teachers:'teacher',managers:'manager'};
    if (roles[values.audience]) where.role = roles[values.audience];
    recipients = await models.User.findAll({ where, attributes:['id','phone'], raw:true });
  }
  const unique = [...new Map(recipients.filter(u => /^\+[1-9]\d{7,14}$/.test(u.phone || '')).map(u => [u.phone,u])).values()];
  if (!unique.length) throw new ApiError(400,'NO_RECIPIENTS','No hay destinatarios con teléfono y suscripción a WhatsApp.');
  const payload = { channel: values.channel, audience: values.audience, subject: values.subject, body: values.body };
  if (values.audience === 'student') payload.targetStudentId = Number(values.targetStudentId);
  if (values.audience === 'guardian') payload.targetGuardianId = Number(values.targetGuardianId);
  return sequelize.transaction(async transaction => {
    const communication = await models.Communication.create({...payload,schoolId:user.schoolId,createdBy:user.id,sentAt:new Date()},{transaction});
    await models.WhatsappDelivery.bulkCreate(unique.map(recipient => ({schoolId:user.schoolId,communicationId:communication.id,userId:recipient.id,recipient:recipient.phone,payload:templatePayload(config,recipient.phone,values.subject,values.body),status:'pending'})),{transaction});
    return {communication,delivery:{queued:unique.length,sent:0}};
  });
}
export function startWhatsAppWorker() {
  let running = false, stopped = false, active = Promise.resolve();
  async function drain() {
    if (running || stopped) return;
    running = true;
    try {
      const tenants = await controlModels.Tenant.findAll({ where: { status: 'active' }, attributes: ['schoolId'], raw: true });
      const schoolIds = [...new Set([...tenants.map(row => Number(row.schoolId)), Number(process.env.WHATSAPP_SCHOOL_ID)].filter(Number.isSafeInteger))];
      for (const schoolId of schoolIds) {
      const tenantModels = (await databaseForTenant(schoolId)).models;
      const config = await whatsappConfig(schoolId, tenantModels);
      if (!config.configured) continue;
      const pending = await tenantModels.WhatsappDelivery.findAll({where:{schoolId,status:'pending'},order:[['id','ASC']],limit:20});
      for (const delivery of pending) {
        if (stopped) break;
        const [claimed] = await tenantModels.WhatsappDelivery.update({status:'sending'},{where:{id:delivery.id,schoolId,status:'pending'}});
        if (!claimed) continue;
        try {
          const user = await tenantModels.User.findOne({where:{id:delivery.userId,schoolId,active:true,whatsappOptIn:true,phone:delivery.recipient}});
          if (!user) { await delivery.update({status:'cancelled',error:'Destinatario sin suscripción vigente.'}); continue; }
          const response = await fetch(`https://graph.facebook.com/${config.version}/${config.phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},body:JSON.stringify(delivery.payload),signal:AbortSignal.timeout(15000)});
          const data = await response.json();
          if (!response.ok || !data.messages?.[0]?.id) { await delivery.update({status:'failed',error:`Meta HTTP ${response.status}, código ${Number(data.error?.code) || 0}`}); continue; }
          await delivery.update({status:'accepted',externalId:data.messages[0].id,error:null});
        } catch { await delivery.update({status:'unknown',error:'Resultado no confirmado. Revisa Meta antes de reenviar para evitar duplicados.'}); }
      }
      }
    } catch (error) { console.warn('No se pudo procesar la cola WhatsApp:',error.name); }
    finally {running=false;}
  }
  const timer = setInterval(() => { active=drain(); },5000); timer.unref();
  return async () => {stopped=true;clearInterval(timer);await active;};
}
