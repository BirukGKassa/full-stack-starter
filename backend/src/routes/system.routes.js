import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db, dbType, pool, schema } from '../db/index.js';
import { createLicense, getLicenseStatus } from '../system/license.js';
import { getAdminSetupLink } from '../system/admin-setup.js';

const router = Router();
const adminEmails = new Set((process.env.LYU_ADMIN_EMAILS || '')
  .split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));
const {
  companyProfiles,
  machineDowntimeLogs,
  productionAuditLogs,
  session,
  systemEvents,
  systemLicenses,
  user,
} = schema;

function requestHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return headers;
}

async function getActor(req) {
  const current = await auth.api.getSession({ headers: requestHeaders(req) });
  if (!current?.user) return null;
  return { ...current.user, currentSessionId: current.session.id };
}

async function requireAdmin(req, res) {
  const actor = await getActor(req);
  if (!actor) {
    res.status(401).json({ status: 'fail', message: 'Sign in to continue.' });
    return null;
  }
  if (!adminEmails.has(String(actor.email).toLowerCase())) {
    res.status(403).json({ status: 'fail', message: 'Administrator access is required.' });
    return null;
  }
  const [account] = await db.select({ isActive: user.isActive }).from(user).where(eq(user.id, actor.id));
  if (!account?.isActive) {
    res.status(403).json({ status: 'fail', message: 'This account is inactive.' });
    return null;
  }
  return actor;
}

function connectionSummary() {
  let databaseHost = 'Configured database';
  let databaseName = null;
  try {
    const url = new URL(process.env.DATABASE_URL);
    databaseHost = url.hostname;
    databaseName = decodeURIComponent(url.pathname.replace(/^\/+/, '')) || null;
  } catch {
    if (process.env.DATABASE_URL) databaseHost = 'Configured database URL';
  }
  return { type: dbType, host: databaseHost, database: databaseName };
}

async function publicCompany() {
  const [company] = await db.select({
    companyName: companyProfiles.companyName,
    legalName: companyProfiles.legalName,
    taxNumber: companyProfiles.taxNumber,
    email: companyProfiles.email,
    phone: companyProfiles.phone,
    website: companyProfiles.website,
    addressLine1: companyProfiles.addressLine1,
    addressLine2: companyProfiles.addressLine2,
    city: companyProfiles.city,
    region: companyProfiles.region,
    postalCode: companyProfiles.postalCode,
    country: companyProfiles.country,
  }).from(companyProfiles).where(eq(companyProfiles.id, 'primary'));
  return company || null;
}

router.get('/api/public/system', async (req, res, next) => {
  try {
    const [company, license, actor] = await Promise.all([publicCompany(), getLicenseStatus(), getActor(req)]);
    const configuredAdmins = [...adminEmails];
    const existingAdmins = configuredAdmins.length
      ? await db.select({ id: user.id }).from(user).where(
          configuredAdmins.length === 1
            ? eq(user.email, configuredAdmins[0])
            : inArray(user.email, configuredAdmins),
        )
      : [];
    let adminSetupLink = null;
    if (configuredAdmins.length && !existingAdmins.length && process.env.REGISTER_ADMIN_LINK) {
      adminSetupLink = getAdminSetupLink();
    }
    res.json({
      company,
      systemName: process.env.APP_NAME || 'Lyu ERP',
      isAdmin: Boolean(actor && adminEmails.has(String(actor.email).toLowerCase())),
      adminSetupLink,
      license: {
        status: license.status,
        isActive: license.isActive,
        daysRemaining: license.daysRemaining,
        expiresAt: license.expiresAt,
        durationDays: license.durationDays,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/api/account/sessions', async (req, res, next) => {
  try {
    const actor = await getActor(req);
    if (!actor) return res.status(401).json({ status: 'fail', message: 'Sign in to continue.' });
    const sessions = await db.select({
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    }).from(session).where(and(eq(session.userId, actor.id), gt(session.expiresAt, new Date())))
      .orderBy(desc(session.updatedAt));
    res.json({ status: 'success', data: sessions.map((item) => ({
      ...item,
      isCurrent: item.id === actor.currentSessionId,
    })) });
  } catch (error) {
    next(error);
  }
});

router.delete('/api/account/sessions/:sessionId', async (req, res, next) => {
  try {
    const actor = await getActor(req);
    if (!actor) return res.status(401).json({ status: 'fail', message: 'Sign in to continue.' });
    await db.delete(session).where(and(
      eq(session.id, req.params.sessionId),
      eq(session.userId, actor.id),
    ));
    res.json({ status: 'success', data: { revoked: true, sessionId: req.params.sessionId } });
  } catch (error) {
    next(error);
  }
});

router.get('/api/admin/system', async (req, res) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;
  try {
    const licenseState = await getLicenseStatus(true);
    if (!licenseState.isActive) {
      return res.status(402).json({ status: 'fail', code: 'LICENSE_REQUIRED', message: 'Only license recovery is available until a valid license is active.' });
    }
    const now = new Date();
    const [license, company, users, sessions, errors, activity, downtime, licenses] = await Promise.all([
      getLicenseStatus(true),
      publicCompany(),
      db.select({ id: user.id, name: user.name, email: user.email }).from(user),
      db.select({
        id: session.id,
        userId: session.userId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      }).from(session).where(gt(session.expiresAt, now)).orderBy(desc(session.updatedAt)).limit(250),
      db.select().from(systemEvents).orderBy(desc(systemEvents.createdAt)).limit(100),
      db.select().from(productionAuditLogs).orderBy(desc(productionAuditLogs.createdAt)).limit(100),
      db.select().from(machineDowntimeLogs).orderBy(desc(machineDowntimeLogs.startTime)).limit(100),
      db.select({
        id: systemLicenses.id,
        keyLastFour: systemLicenses.keyLastFour,
        status: systemLicenses.status,
        startsAt: systemLicenses.startsAt,
        expiresAt: systemLicenses.expiresAt,
        activatedAt: systemLicenses.activatedAt,
        createdAt: systemLicenses.createdAt,
      }).from(systemLicenses).orderBy(desc(systemLicenses.createdAt)).limit(25),
    ]);
    const usersById = new Map(users.map((item) => [item.id, item.name]));
    let databaseStatus = 'connected';
    try {
      if (dbType === 'pg') await pool.query('select 1');
      else await pool.query('SELECT 1');
    } catch {
      databaseStatus = 'unavailable';
    }
    res.json({
      status: 'success',
      data: {
        database: { ...connectionSummary(), status: databaseStatus },
        system: {
          appName: process.env.APP_NAME || 'Lyu ERP',
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
          uptimeSeconds: Math.floor(process.uptime()),
          serverTime: now,
          activeSessions: sessions.length,
          activeUsers: new Set(sessions.map((item) => item.userId)).size,
          errorCount: errors.filter((item) => item.level === 'error').length,
        },
        license,
        licenses,
        company,
        sessions: sessions.map((item) => ({ ...item, userName: usersById.get(item.userId) || 'Unknown user' })),
        errors,
        activity,
        downtime,
      },
    });
  } catch (error) {
    console.error('Could not load system administration data:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Could not load system information.' });
  }
});

router.get('/api/admin/license-status', async (req, res) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;
  try {
    const [license, licenses] = await Promise.all([
      getLicenseStatus(true),
      db.select({
        id: systemLicenses.id,
        keyLastFour: systemLicenses.keyLastFour,
        status: systemLicenses.status,
        startsAt: systemLicenses.startsAt,
        expiresAt: systemLicenses.expiresAt,
        activatedAt: systemLicenses.activatedAt,
        createdAt: systemLicenses.createdAt,
      }).from(systemLicenses).orderBy(desc(systemLicenses.createdAt)).limit(25),
    ]);
    res.json({ status: 'success', data: { license, licenses } });
  } catch (error) {
    console.error('Could not load license information:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Could not load license information.' });
  }
});

router.put('/api/admin/company', async (req, res) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;
  try {
    const license = await getLicenseStatus(true);
    if (!license.isActive) {
      return res.status(402).json({ status: 'fail', code: 'LICENSE_REQUIRED', message: 'Only license recovery is available until a valid license is active.' });
    }
    const companyName = String(req.body.companyName || '').trim();
    if (companyName.length < 2 || companyName.length > 255) {
      return res.status(400).json({ status: 'fail', message: 'Company name must be between 2 and 255 characters.' });
    }
    const fields = {
      companyName,
      legalName: String(req.body.legalName || '').trim() || null,
      taxNumber: String(req.body.taxNumber || '').trim() || null,
      email: String(req.body.email || '').trim() || null,
      phone: String(req.body.phone || '').trim() || null,
      website: String(req.body.website || '').trim() || null,
      addressLine1: String(req.body.addressLine1 || '').trim() || null,
      addressLine2: String(req.body.addressLine2 || '').trim() || null,
      city: String(req.body.city || '').trim() || null,
      region: String(req.body.region || '').trim() || null,
      postalCode: String(req.body.postalCode || '').trim() || null,
      country: String(req.body.country || '').trim() || null,
      updatedBy: actor.id,
      updatedAt: new Date(),
    };
    const [existing] = await db.select({ id: companyProfiles.id }).from(companyProfiles).where(eq(companyProfiles.id, 'primary'));
    if (existing) {
      await db.update(companyProfiles).set(fields).where(eq(companyProfiles.id, 'primary'));
    } else {
      await db.insert(companyProfiles).values({
        id: 'primary',
        ...fields,
        createdAt: new Date(),
      });
    }
    res.json({ status: 'success', data: await publicCompany() });
  } catch (error) {
    console.error('Could not update company profile:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Could not save company profile.' });
  }
});

router.post('/api/admin/licenses', async (req, res) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;
  try {
    const status = await createLicense(req.body.licenseKey, actor.id);
    res.status(201).json({ status: 'success', data: status });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: error.statusCode ? 'fail' : 'error', message: error.message });
  }
});

router.post('/api/admin/licenses/refresh', async (req, res) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;
  try {
    res.json({ status: 'success', data: await getLicenseStatus(true) });
  } catch (error) {
    console.error('Could not refresh license:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Could not refresh license status.' });
  }
});

router.delete('/api/admin/users/:userId/sessions', async (req, res) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;
  try {
    const userId = req.params.userId;
    await db.delete(session).where(eq(session.userId, userId));
    res.json({ status: 'success', data: { userId, revoked: true } });
  } catch (error) {
    console.error('Could not revoke user sessions:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Could not revoke sessions.' });
  }
});

router.use('/api/admin', (_req, res) => res.status(404).json({ status: 'fail', message: 'System route not found.' }));

export default router;

export async function recordSystemEvent(event) {
  try {
    await db.insert(systemEvents).values({
      id: randomUUID(),
      level: event.level || 'error',
      category: event.category || 'system',
      message: String(event.message || 'System event').slice(0, 1000),
      path: event.path ? String(event.path).slice(0, 500) : null,
      statusCode: event.statusCode || null,
      userId: event.userId || null,
      details: event.details || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Could not persist system event:', error);
  }
}
