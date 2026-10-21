import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

const { systemLicenses } = schema;
const licenseDurationMs = 365 * 24 * 60 * 60 * 1000;
const renewalWindowDays = 10;
let cachedStatus;
let cachedAt = 0;
let refreshPromise;

function hashKey(value) {
  return createHash('sha256').update(value).digest('hex');
}

function matchesConfiguredKey(keyHash) {
  const configuredKey = String(process.env.LICENCE_KEY || '').trim();
  if (!configuredKey || !keyHash) return false;
  const configuredHash = Buffer.from(hashKey(configuredKey), 'hex');
  const storedHash = Buffer.from(keyHash, 'hex');
  return configuredHash.length === storedHash.length && timingSafeEqual(configuredHash, storedHash);
}

function summarize(license, pending, now) {
  const isActive = Boolean(license && new Date(license.startsAt).getTime() <= now
    && new Date(license.expiresAt).getTime() > now);
  const daysRemaining = isActive
    ? Math.max(0, Math.ceil((new Date(license.expiresAt).getTime() - now) / 86400000))
    : 0;
  const nextLicense = pending ? {
    id: pending.id,
    status: 'pending',
    keyLastFour: pending.keyLastFour,
    createdAt: pending.createdAt,
  } : null;
  return {
    status: isActive ? 'active' : license ? 'expired' : pending ? 'pending' : 'unlicensed',
    isActive,
    daysRemaining,
    startsAt: license?.startsAt || null,
    expiresAt: license?.expiresAt || null,
    canAddLicense: !isActive || daysRemaining <= renewalWindowDays,
    renewalWindowDays,
    current: license ? { id: license.id, status: license.status, startsAt: license.startsAt, expiresAt: license.expiresAt, keyLastFour: license.keyLastFour } : null,
    pending: nextLicense,
    configuredKeyPresent: Boolean(String(process.env.LICENCE_KEY || '').trim()),
  };
}

async function refreshLicenseState() {
  const now = new Date();
  const nowMs = now.getTime();
  const licenses = await db.select().from(systemLicenses).orderBy(desc(systemLicenses.createdAt));
  const invalidActive = licenses.filter((item) => item.status === 'active' && !matchesConfiguredKey(item.keyHash));
  for (const item of invalidActive) {
    await db.update(systemLicenses).set({ status: 'pending' }).where(eq(systemLicenses.id, item.id));
    item.status = 'pending';
  }
  let current = licenses.find((item) => item.status === 'active'
    && item.startsAt && item.expiresAt
    && matchesConfiguredKey(item.keyHash)
    && new Date(item.startsAt).getTime() <= nowMs
    && new Date(item.expiresAt).getTime() > nowMs);

  const expired = licenses.filter((item) => item.status === 'active'
    && item.expiresAt
    && new Date(item.expiresAt).getTime() <= nowMs);
  for (const item of expired) {
    await db.update(systemLicenses).set({ status: 'expired' }).where(eq(systemLicenses.id, item.id));
    item.status = 'expired';
  }

  const pending = licenses.find((item) => item.status === 'pending' && matchesConfiguredKey(item.keyHash));
  const daysRemaining = current
    ? Math.ceil((new Date(current.expiresAt).getTime() - nowMs) / 86400000)
    : 0;
  const renewalWindowOpen = !current || daysRemaining <= renewalWindowDays;
  if (pending && renewalWindowOpen) {
    const startsAt = now;
    const expirationBase = current ? new Date(current.expiresAt) : now;
    const expiresAt = new Date(expirationBase.getTime() + licenseDurationMs);
    await db.update(systemLicenses).set({
      status: 'active',
      startsAt,
      expiresAt,
      activatedAt: now,
    }).where(eq(systemLicenses.id, pending.id));
    if (current) {
      await db.update(systemLicenses).set({ status: 'expired' }).where(eq(systemLicenses.id, current.id));
      current.status = 'expired';
    }
    pending.status = 'active';
    pending.startsAt = startsAt;
    pending.expiresAt = expiresAt;
    pending.activatedAt = now;
    current = pending;
  }

  if (!current) {
    current = licenses.find((item) => item.status === 'active' && item.startsAt && item.expiresAt
      && new Date(item.startsAt).getTime() <= nowMs && new Date(item.expiresAt).getTime() > nowMs);
  }
  const latestPending = licenses.find((item) => item.status === 'pending');
  const latestExpired = licenses.find((item) => item.status === 'expired');
  return summarize(current || latestExpired, latestPending, nowMs);
}

export async function getLicenseStatus(forceRefresh = false) {
  if (!forceRefresh && cachedStatus && Date.now() - cachedAt < 10 * 60 * 1000) return cachedStatus;
  if (!refreshPromise) {
    refreshPromise = refreshLicenseState()
      .then((status) => {
        cachedStatus = status;
        cachedAt = Date.now();
        return status;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function createLicense(key, userId) {
  const activationKey = String(key || '').trim();
  if (activationKey.length < 8 || activationKey.length > 512) {
    throw Object.assign(new Error('License key must be between 8 and 512 characters.'), { statusCode: 400 });
  }
  const state = await getLicenseStatus(true);
  if (!state.canAddLicense) {
    throw Object.assign(new Error(`New licenses can be entered when ${state.renewalWindowDays} or fewer days remain.`), { statusCode: 409 });
  }
  const keyHash = hashKey(activationKey);
  const duplicate = await db.select({ id: systemLicenses.id }).from(systemLicenses).where(eq(systemLicenses.keyHash, keyHash));
  if (duplicate.length) {
    throw Object.assign(new Error('This license key has already been registered.'), { statusCode: 409 });
  }

  const matches = matchesConfiguredKey(keyHash);
  const license = {
    id: randomUUID(),
    keyHash,
    keyLastFour: activationKey.slice(-4),
    status: 'pending',
    startsAt: null,
    expiresAt: null,
    activatedAt: null,
    createdBy: userId,
    createdAt: new Date(),
  };
  await db.insert(systemLicenses).values(license);
  const status = await getLicenseStatus(true);
  return {
    ...status,
    submitted: { id: license.id, status: matches ? 'active' : 'pending', keyLastFour: license.keyLastFour },
  };
}

export function startLicenseRefreshTimer() {
  const timer = setInterval(() => {
    getLicenseStatus(true).catch((error) => console.error('Could not refresh license status:', error));
  }, 10 * 60 * 1000);
  timer.unref?.();
  getLicenseStatus(true).catch((error) => console.error('Could not load license status:', error));
}
