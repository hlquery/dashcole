import { controlModels, models } from './database.js';

/**
 * Vincula un usuario local de un colegio a la identidad global (email).
 * Si la persona ya existe en otro colegio, reutiliza la misma GlobalUser
 * y sincroniza la contraseña local con la global (no inventa una clave nueva).
 */
export async function linkTenantIdentity({
  email,
  schoolId,
  userId,
  role,
  fullName,
  passwordHash,
  phone = null,
  syncLocalPassword = true,
} = {}) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !Number.isInteger(Number(schoolId)) || !Number.isInteger(Number(userId))) {
    throw new Error('Identidad de colegio inválida.');
  }

  let globalUser = await controlModels.GlobalUser.findOne({ where: { email: normalized } });
  let created = false;
  let reusedExisting = false;

  if (!globalUser) {
    globalUser = await controlModels.GlobalUser.create({
      email: normalized,
      fullName: fullName || normalized,
      phone: phone || null,
      passwordHash,
      status: 'active',
    });
    created = true;
  } else {
    reusedExisting = true;
    const patch = {};
    if (fullName && globalUser.fullName !== fullName) patch.fullName = fullName;
    if (phone && !globalUser.phone) patch.phone = phone;
    if (Object.keys(patch).length) await globalUser.update(patch);
    if (syncLocalPassword && globalUser.passwordHash) {
      await models.User.update(
        { passwordHash: globalUser.passwordHash },
        { where: { id: userId, schoolId } },
      );
    }
  }

  let membership = await controlModels.TenantMembership.findOne({
    where: { globalUserId: globalUser.id, schoolId },
  });

  if (membership) {
    await membership.update({
      userId,
      role,
      status: 'active',
      leftAt: null,
    });
  } else {
    membership = await controlModels.TenantMembership.create({
      globalUserId: globalUser.id,
      schoolId,
      userId,
      role,
      status: 'active',
    });
  }

  return { globalUser, membership, created, reusedExisting };
}

/** Activa o suspende la membresía del colegio para un userId local. */
export async function setTenantMembershipAccess({ userId, schoolId, active }) {
  if (!userId || !schoolId) return null;
  const membership = await controlModels.TenantMembership.findOne({
    where: { userId, schoolId },
  });
  if (!membership) return null;
  await membership.update({
    status: active ? 'active' : 'suspended',
    leftAt: active ? null : new Date(),
  });
  return membership;
}

/** Marca la membresía como left (salida del colegio). */
export async function leaveTenantMembership({ userId, schoolId }) {
  if (!userId || !schoolId) return null;
  const membership = await controlModels.TenantMembership.findOne({
    where: { userId, schoolId },
  });
  if (!membership) return null;
  await membership.update({ status: 'left', leftAt: new Date() });
  return membership;
}
