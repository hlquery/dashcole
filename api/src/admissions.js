import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { controlModels, defaultModels, models, redis, runWithTenantDatabase, sequelize } from './database.js';
import { linkTenantIdentity } from './tenant-identity.js';
import { ApiError } from './http.js';
import { createCommunication } from './services/mail.js';
import { databaseForTenant } from './database-routing.js';
import { getDemoResetStatus, resetDemoDataWithAdminCredentials } from './services/demo-reset.js';
import { isValidRut, normalizeRut } from './services/mineduc.js';
import { isSmtpConfigured } from './services/smtp-config.js';
import { safeUploadPath } from './uploads.js';

const statuses = ['received', 'interview', 'evaluated', 'waiting', 'accepted', 'rejected'];
const statusLabels = {
  received: 'Recibida',
  interview: 'Entrevista',
  evaluated: 'Evaluada',
  waiting: 'En espera',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

function admissionStatusEmail(application, status, schoolName, reference = '') {
  const student = `${application.studentFirstName} ${application.studentLastName}`.trim();
  const school = schoolName || 'el colegio';
  const guardian = application.guardianName || 'familia';
  const tracking = reference
    ? `\n\nNúmero de seguimiento: ${reference}`
    : '';
  const messages = {
    received: {
      subject: `Postulación recibida · ${student}`,
      body: `Hola ${guardian},\n\nConfirmamos que recibimos la postulación de ${student} a ${school} para ${application.requestedLevel}.${tracking}\n\nTe avisaremos por este mismo correo cuando avancemos en el proceso.`,
    },
    interview: {
      subject: `Entrevista de admisión · ${student}`,
      body: `Hola ${guardian},\n\nLa postulación de ${student} a ${school} (${application.requestedLevel}) pasó a etapa de entrevista.\n\nPronto te contactaremos para coordinar día y hora. Si tienes dudas, responde este correo.`,
    },
    evaluated: {
      subject: `Evaluación de postulación · ${student}`,
      body: `Hola ${guardian},\n\nLa postulación de ${student} a ${school} está en evaluación.\n\nTe informaremos el resultado apenas esté disponible.`,
    },
    waiting: {
      subject: `Postulación en lista de espera · ${student}`,
      body: `Hola ${guardian},\n\nLa postulación de ${student} a ${school} (${application.requestedLevel}) quedó en lista de espera.\n\nTe contactaremos si se libera un cupo o si necesitamos más antecedentes.`,
    },
    accepted: {
      subject: `Postulación aceptada · ${student}`,
      body: `Hola ${guardian},\n\n¡Buenas noticias! La postulación de ${student} a ${school} para ${application.requestedLevel} fue aceptada.\n\nEl colegio se contactará contigo para completar la matrícula y los siguientes pasos.`,
    },
    rejected: {
      subject: `Resultado de postulación · ${student}`,
      body: `Hola ${guardian},\n\nLamentamos informarte que la postulación de ${student} a ${school} para ${application.requestedLevel} no fue aceptada en este proceso.\n\nAgradecemos tu interés en ${school}.`,
    },
  };
  return messages[status] || {
    subject: `Actualización de postulación · ${student}`,
    body: `Hola ${guardian},\n\nLa postulación de ${student} a ${school} cambió a estado “${statusLabels[status] || status}”.\n\nSi necesitas más información, responde este correo.`,
  };
}
const admissionLevels = [
  'Prekínder', 'Kínder',
  '1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico',
  '1° Medio', '2° Medio', '3° Medio', '4° Medio',
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;
const publicNamespace = crypto.createHash('sha256').update(`${process.env.CONTROL_MYSQL_DATABASE || process.env.MYSQL_DATABASE || 'dashcole'}:${process.env.NODE_ENV || 'development'}`).digest('hex').slice(0, 12);
const localRateLimits = new Map();

function storedRut(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (!isValidRut(raw)) throw new ApiError(400, 'VALIDATION_ERROR', 'Ingresa un RUT válido, por ejemplo 12345678-9.');
  const normalized = normalizeRut(raw);
  const match = normalized.match(/^(\d{1,9})-?([0-9K])$/);
  return match ? `${match[1]}-${match[2]}` : normalized;
}

async function publicSchool(ref) {
  const value = String(ref || '').trim();
  if (!value) throw new ApiError(400, 'TENANT_REQUIRED', 'Indica el colegio al que deseas postular.');
  const where = { status: 'active' };
  if (/^\d+$/.test(value)) where.schoolId = Number(value);
  else where.slug = value.toLowerCase();
  const tenant = await controlModels.Tenant.findOne({ where, order: [['schoolId', 'ASC']], raw: true });
  if (!tenant) throw new ApiError(404, 'NOT_FOUND', 'Colegio no encontrado o no disponible para postular.');
  const database = await databaseForTenant(tenant.schoolId);
  const school = await database.models.School.findOne({ where: { id: tenant.schoolId, active: true } });
  if (!school) throw new ApiError(503, 'TENANT_UNAVAILABLE', 'El colegio no está disponible.');
  return { school, database, tenant };
}

async function rateLimit(ip, bucket, limit) {
  const digest = crypto.createHash('sha256').update(String(ip)).digest('hex');
  if (!redis.isReady) {
    const key = `${bucket}:${digest}`, now = Date.now();
    const current = localRateLimits.get(key);
    const entry = !current || current.expiresAt <= now ? { count: 0, expiresAt: now + 3600000 } : current;
    entry.count += 1;
    localRateLimits.set(key, entry);
    if (localRateLimits.size > 10000) {
      for (const [candidate, value] of localRateLimits) if (value.expiresAt <= now) localRateLimits.delete(candidate);
    }
    if (entry.count > limit) throw new ApiError(429, 'RATE_LIMITED', 'Demasiados envíos. Intenta nuevamente más tarde.');
    return digest;
  }
  const key = `dashcole:public:${publicNamespace}:${bucket}:${digest}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 3600);
  if (count > limit) throw new ApiError(429, 'RATE_LIMITED', 'Demasiados envíos. Intenta nuevamente más tarde.');
  return digest;
}

function applicationInput(body) {
  const value = {
    studentFirstName: String(body.studentFirstName || '').trim(),
    studentLastName: String(body.studentLastName || '').trim(),
    studentRut: storedRut(body.studentRut),
    guardianName: String(body.guardianName || '').trim(),
    guardianEmail: String(body.guardianEmail || '').trim().toLowerCase(),
    guardianPhone: String(body.guardianPhone || '').trim() || null,
    guardianRut: storedRut(body.guardianRut),
    requestedLevel: String(body.requestedLevel || '').trim(),
    answers: body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers) ? body.answers : {},
  };
  if (value.studentFirstName.length < 2 || value.studentFirstName.length > 80 || value.studentLastName.length < 2 || value.studentLastName.length > 80) throw new ApiError(400, 'VALIDATION_ERROR', 'Completa el nombre del estudiante.');
  if (value.guardianName.length < 3 || value.guardianName.length > 120 || !emailPattern.test(value.guardianEmail)) throw new ApiError(400, 'VALIDATION_ERROR', 'Completa los datos de contacto del apoderado.');
  if (value.guardianPhone && !phonePattern.test(value.guardianPhone)) throw new ApiError(400, 'VALIDATION_ERROR', 'Usa un teléfono con código de país, por ejemplo +56912345678.');
  if (!admissionLevels.includes(value.requestedLevel) || JSON.stringify(value.answers).length > 12000) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona un nivel válido y revisa las respuestas.');
  return value;
}

export function registerAdmissionsRoutes(app) {
  app.get('/api/public/admissions/schools', async (_req, res) => {
    const schools = await controlModels.Tenant.findAll({ where: { status: 'active' }, attributes: ['name', 'slug'], order: [['name', 'ASC']], raw: true });
    res.json(schools);
  });
  app.post('/api/track/visit', async (req, res) => {
    await rateLimit(req.ip, 'visits', 120);
    const route = String(req.body.route || req.body.path || '').slice(0, 500);
    if (!route.startsWith('/')) return res.status(204).end();
    const sessionHash = crypto.createHash('sha256').update(String(req.body.session_id || req.ip)).digest('hex');
    let referrerHost = null;
    try { referrerHost = req.body.referrer ? new URL(req.body.referrer).hostname.slice(0, 253) : null; } catch { /* Ignore malformed referrers. */ }
    await models.PageVisit.create({ route, sessionHash, referrerHost, sourceApp: String(req.body.source_app || 'web').slice(0, 40) });
    res.status(204).end();
  });
  app.get('/api/public/admissions/config', async (req, res) => {
    const ref = req.query.schoolId || req.query.school;
    const { school } = await publicSchool(ref);
    res.json({
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        hasLogo: Boolean(school.logoKey),
      },
      levels: admissionLevels,
      questions: [
        { id: 'motivation', label: '¿Por qué desea postular a este colegio?', required: true },
        { id: 'support', label: '¿Hay antecedentes de aprendizaje o apoyos que debamos conocer?', required: false },
        { id: 'expectations', label: '¿Qué espera la familia de la comunidad educativa?', required: true },
      ],
    });
  });
  app.get('/api/public/admissions/logo', async (req, res) => {
    const ref = req.query.schoolId || req.query.school;
    const { school } = await publicSchool(ref);
    if (!school.logoKey) return res.status(404).json({ message: 'Este colegio aún no tiene logo.' });
    res.set('Cache-Control', 'public, max-age=300');
    res.sendFile(safeUploadPath(school.logoKey));
  });
  app.post('/api/public/admissions', async (req, res) => {
    await rateLimit(req.ip, 'admissions', 5);
    if (String(req.body.website || '')) return res.status(204).end();
    if (req.body.consent !== true) throw new ApiError(400, 'CONSENT_REQUIRED', 'Debes aceptar el tratamiento de estos datos para enviar la postulación.');
    const { school, database } = await publicSchool(req.body.schoolId || req.body.school);
    const application = await database.models.AdmissionApplication.create({ ...applicationInput(req.body), schoolId: school.id, answers: req.body.answers || {}, status: 'received' });
    const reference = `POST-${school.id}-${application.id}`;
    let mailQueued = false;
    const email = String(application.guardianEmail || '').trim();
    if (emailPattern.test(email) && await isSmtpConfigured()) {
      try {
        const schoolPayload = typeof school.toJSON === 'function' ? school.toJSON() : school;
        const message = admissionStatusEmail(application, 'received', school.name, reference);
        await runWithTenantDatabase(database, () => createCommunication(
          { id: null, schoolId: school.id },
          { channel: 'email', audience: 'guardians', subject: message.subject, body: message.body },
          [email],
          schoolPayload,
        ));
        mailQueued = true;
      } catch (err) {
        console.warn(`Admission receipt mail failed for ${reference}:`, err?.message || err);
      }
    }
    res.status(201).json({ reference, status: application.status, mailQueued });
  });
  app.post('/api/public/demo-requests', async (req, res) => {
    const sourceIpHash = await rateLimit(req.ip, 'demo-requests', 5);
    if (String(req.body.website || '')) return res.status(204).end();
    const name = String(req.body.name || '').trim(), email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim(), organization = String(req.body.organization || '').trim();
    const studentCount = req.body.studentCount === '' || req.body.studentCount == null ? null : Number(req.body.studentCount);
    const message = String(req.body.message || '').trim();
    if (name.length < 2 || name.length > 120 || !emailPattern.test(email) || organization.length < 2 || organization.length > 150 || phone && !phonePattern.test(phone) || studentCount !== null && (!Number.isInteger(studentCount) || studentCount < 1 || studentCount > 100000) || message.length > 5000) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa nombre, institución, correo, teléfono y cantidad de estudiantes.');
    const request = await controlModels.DemoRequest.create({ name, email, phone: phone || null, organization, studentCount, message: message || null, sourceIpHash });
    res.status(201).json({ reference: `DEMO-${request.id}`, message: 'Recibimos tu solicitud. Te contactaremos para activar el colegio.' });
  });
  app.get('/api/public/demo-reset', async (_req, res) => {
    res.json(await getDemoResetStatus());
  });
  app.post('/api/public/demo-reset', async (req, res) => {
    await rateLimit(req.ip, 'demo-reset', 10);
    if (req.body.confirm !== true) throw new ApiError(400, 'CONFIRM_REQUIRED', 'Debes confirmar el reinicio de los datos demo.');
    const result = await resetDemoDataWithAdminCredentials({
      username: req.body.username || req.body.email,
      password: req.body.password,
    });
    res.json({
      message: 'Datos demo restablecidos. Colegios y usuarios de demostración volvieron al estado inicial.',
      ...result,
    });
  });
  app.post('/api/contact/messages', async (req, res) => {
    const sourceIpHash = await rateLimit(req.ip, 'contact', 8);
    if (String(req.body.website || '')) return res.status(204).end();
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const organization = String(req.body.organization || '').trim();
    const subject = String(req.body.subject || 'Consulta desde el sitio').trim();
    const body = String(req.body.message || req.body.body || '').trim();
    if (name.length < 2 || name.length > 120 || !emailPattern.test(email) || organization.length > 150 || subject.length < 3 || subject.length > 180 || body.length < 10 || body.length > 5000) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa nombre, correo, asunto y mensaje.');
    const resolved = req.body.school ? await publicSchool(req.body.school) : null;
    const message = await (resolved?.database.models.ContactMessage || defaultModels.ContactMessage).create({ schoolId: resolved?.school.id || null, name, email, organization: organization || null, subject, body, sourceIpHash });
    res.status(201).json({ reference: `CONTACT-${message.id}` });
  });
}

export function registerAdmissionsAdminRoutes(app) {
  app.get('/api/admissions', async (req, res) => {
    if (!req.user.permissions?.manageUsers) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para revisar postulaciones.');
    const status = statuses.includes(req.query.status) ? req.query.status : undefined;
    const excludeRejected = ['1', 'true'].includes(String(req.query.excludeRejected || '').toLowerCase());
    const q = String(req.query.q || '').trim().slice(0, 120);
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize) || 20));
    const where = {
      schoolId: req.user.schoolId,
      ...(status ? { status } : (excludeRejected ? { status: { [Op.ne]: 'rejected' } } : {})),
    };
    if (q) {
      const like = { [Op.like]: `%${q.replace(/[%_]/g, '\\$&')}%` };
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { studentFirstName: like },
            { studentLastName: like },
            { studentRut: like },
            { guardianName: like },
            { guardianEmail: like },
            { guardianRut: like },
            { requestedLevel: like },
          ],
        },
      ];
    }
    const [result, activeTotal, rejectedTotal] = await Promise.all([
      models.AdmissionApplication.findAndCountAll({
        where,
        order: [['updated_at', 'DESC'], ['created_at', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      models.AdmissionApplication.count({ where: { schoolId: req.user.schoolId, status: { [Op.ne]: 'rejected' } } }),
      models.AdmissionApplication.count({ where: { schoolId: req.user.schoolId, status: 'rejected' } }),
    ]);
    res.json({
      rows: result.rows,
      total: result.count,
      page,
      pageSize,
      counts: { active: activeTotal, rejected: rejectedTotal },
    });
  });
  app.put('/api/admissions/:id/status', async (req, res) => {
    if (!req.user.permissions?.manageUsers) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para revisar postulaciones.');
    const status = String(req.body.status || '');
    const reviewerNotes = String(req.body.reviewerNotes || '').trim();
    if (!statuses.includes(status) || reviewerNotes.length > 5000) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado o notas inválidas.');
    const application = await models.AdmissionApplication.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId } });
    if (!application) throw new ApiError(404, 'NOT_FOUND', 'Postulación no encontrada.');
    const previousStatus = application.status;
    await application.update({ status, reviewerNotes: reviewerNotes || null });
    await models.AuditLog.create({
      schoolId: req.user.schoolId,
      createdBy: req.user.id,
      action: 'admission_status',
      entity: 'admission',
      entityId: application.id,
      payload: { status, previousStatus, notified: status !== previousStatus },
    });
    let delivery = null;
    let mailWarning = null;
    if (status !== previousStatus) {
      const email = String(application.guardianEmail || '').trim();
      if (!emailPattern.test(email)) {
        mailWarning = 'Estado actualizado, pero la postulación no tiene un correo de apoderado válido para notificar.';
      } else {
        try {
          const school = await models.School.findByPk(req.user.schoolId, { raw: true });
          const message = admissionStatusEmail(application, status, school?.name);
          const result = await createCommunication(
            req.user,
            { channel: 'email', audience: 'guardians', subject: message.subject, body: message.body },
            [email],
            school,
          );
          delivery = result.delivery;
        } catch (err) {
          mailWarning = err?.message || 'Estado actualizado, pero no se pudo encolar el correo al apoderado.';
        }
      }
    }
    res.json({ application, delivery, mailWarning, previousStatus });
  });
  app.post('/api/admissions/:id/enroll', async (req, res) => {
    if (!req.user.permissions?.manageUsers) throw new ApiError(403, 'FORBIDDEN', 'No tienes permiso para matricular postulantes.');
    const application = await models.AdmissionApplication.findOne({ where: { id: req.params.id, schoolId: req.user.schoolId, status: 'accepted' } });
    const selectedIds = [...new Set((req.body.courseIds || []).map(Number).filter(Number.isSafeInteger))];
    if (!application || !selectedIds.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona una postulación aceptada y al menos un curso.');
    if (/Matriculado como estudiante #/.test(String(application.reviewerNotes || ''))) {
      throw new ApiError(409, 'ALREADY_ENROLLED', 'Esta postulación ya fue matriculada.');
    }
    const selected = await models.Course.findAll({ where: { id: selectedIds, schoolId: req.user.schoolId } });
    if (selected.length !== selectedIds.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Uno de los cursos no pertenece al colegio.');
    const modules = await models.Course.findAll({
      where: {
        schoolId: req.user.schoolId,
        [Op.or]: selected.map((course) => ({
          name: course.name,
          section: course.section,
          academicYearId: course.academicYearId,
        })),
      },
    });
    const courseIds = [...new Set(modules.map((course) => course.id))];
    if (!courseIds.length) throw new ApiError(400, 'VALIDATION_ERROR', 'No encontramos asignaturas para ese curso.');
    const username = String(req.body.username || '').trim().toLowerCase();
    const generatePassword = req.body.generatePassword !== false;
    const password = generatePassword ? crypto.randomBytes(12).toString('base64url') : String(req.body.password || '');
    if (!/^[a-z0-9][a-z0-9._@-]{2,149}$/.test(username) || password.length < 6) throw new ApiError(400, 'VALIDATION_ERROR', 'Define un usuario y contraseña temporal válidos.');
    const student = await sequelize.transaction(async transaction => {
      const user = await models.User.create({ schoolId: req.user.schoolId, createdBy: req.user.id, username, passwordHash: await bcrypt.hash(password, 12), fullName: `${application.studentFirstName} ${application.studentLastName}`, role: 'student', active: true }, { transaction });
      const record = await models.Student.create({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        userId: user.id,
        firstName: application.studentFirstName,
        lastName: application.studentLastName,
        email: username.includes('@') ? username : null,
        nationalId: application.studentRut || null,
        identifierType: 'rut',
        active: true,
      }, { transaction });
      const guardianPassword = crypto.randomBytes(12).toString('base64url');
      let guardianUser = null;
      let createdGuardianUser = false;
      if (application.guardianEmail) {
        const result = await models.User.findOrCreate({
          where: { schoolId: req.user.schoolId, username: application.guardianEmail },
          defaults: {
            passwordHash: await bcrypt.hash(guardianPassword, 12),
            fullName: application.guardianName,
            role: 'guardian',
            createdBy: req.user.id,
            active: true,
          },
          transaction,
        });
        guardianUser = result[0];
        createdGuardianUser = result[1];
      }
      const guardian = await models.Guardian.create({
        schoolId: req.user.schoolId,
        createdBy: req.user.id,
        userId: guardianUser?.id || null,
        fullName: application.guardianName,
        email: application.guardianEmail,
        phone: application.guardianPhone,
        nationalId: application.guardianRut || null,
      }, { transaction });
      await models.StudentGuardian.create({ studentId: record.id, guardianId: guardian.id, relationship: 'Apoderado/a' }, { transaction });
      await models.Enrollment.bulkCreate(courseIds.map(courseId => ({ schoolId: req.user.schoolId, studentId: record.id, courseId, status: 'active' })), { transaction });
      await application.update({ reviewerNotes: [application.reviewerNotes, `Matriculado como estudiante #${record.id}`].filter(Boolean).join('\n') }, { transaction });
      return {
        record,
        guardianUsername: application.guardianEmail || null,
        guardianPassword: createdGuardianUser ? guardianPassword : null,
      };
    });
    const user = await models.User.findByPk(student.record.userId, { raw: true });
    await linkTenantIdentity({
      email: username,
      schoolId: req.user.schoolId,
      userId: user.id,
      role: 'student',
      fullName: user.fullName || user.full_name,
      passwordHash: user.passwordHash || user.password_hash,
    });
    if (student.guardianUsername) {
      const guardianUser = await models.User.findOne({
        where: { schoolId: req.user.schoolId, username: student.guardianUsername, role: 'guardian' },
        raw: true,
      });
      if (guardianUser) {
        await linkTenantIdentity({
          email: student.guardianUsername,
          schoolId: req.user.schoolId,
          userId: guardianUser.id,
          role: 'guardian',
          fullName: guardianUser.fullName || guardianUser.full_name,
          passwordHash: guardianUser.passwordHash || guardianUser.password_hash,
        });
      }
    }
    res.status(201).json({
      student: student.record,
      temporaryPassword: password,
      guardianUsername: student.guardianUsername,
      guardianTemporaryPassword: student.guardianPassword,
      enrolledModules: courseIds.length,
    });
  });
}
