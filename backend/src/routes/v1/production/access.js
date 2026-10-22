import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { auth } from '../../../auth.js';
import { db, schema } from '../../../db/index.js';
import { getLicenseStatus } from '../../../system/license.js';
import { availableModules } from './modules.js';

const { moduleAssignments, productionAuditLogs, user } = schema;

const routeModules = {
  boms: 'products',
  'work-centers': 'machines',
  'manufacturing-orders': 'orders',
  'production-logs': 'production',
  downtime: 'downtime',
  quality: 'quality',
  tools: 'machines',
  traceability: 'quality',
  analytics: 'reports',
};

const readModules = {
  boms: ['products', 'orders', 'overview'],
  'work-centers': ['machines', 'production', 'downtime', 'orders', 'quality', 'overview'],
  'manufacturing-orders': ['orders', 'production', 'quality', 'reports', 'overview'],
  'production-logs': ['production', 'reports', 'overview'],
  downtime: ['downtime', 'production', 'reports', 'overview'],
  quality: ['quality', 'overview'],
  tools: ['machines', 'overview'],
  traceability: ['quality', 'overview'],
  analytics: ['reports', 'overview'],
};

const adminEmails = new Set(
  (process.env.LYU_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);
export const ADMIN_ROLE = '__admin__';
export const REVOKED_ADMIN_ROLE = '__admin_revoked__';

export function getOwnerEmail() {
  return String(process.env.LYU_OWNER_EMAIL || [...adminEmails][0] || '').trim().toLowerCase();
}

export function isOwnerEmail(email) {
  return String(email || '').trim().toLowerCase() === getOwnerEmail();
}

function requestHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return headers;
}

function pathParts(req) {
  return req.originalUrl.split('?')[0].replace(/^\/api\/v1\/production\/?/, '').split('/').filter(Boolean);
}

function auditAction(method) {
  if (method === 'POST') return 'create';
  if (method === 'PUT' || method === 'PATCH') return 'update';
  if (method === 'DELETE') return 'delete';
  return null;
}

export async function productionAccess(req, res, next) {
  try {
    const session = await auth.api.getSession({ headers: requestHeaders(req) });
    if (!session?.user) {
      return res.status(401).json({ status: 'fail', message: 'Sign in to access production operations.' });
    }

    const ownerEmail = getOwnerEmail();
    const [owner] = ownerEmail
      ? await db.select({ id: user.id }).from(user)
        .where(and(eq(user.email, ownerEmail), eq(user.isActive, true)))
      : [];
    if (!owner) {
      return res.status(403).json({ status: 'fail', code: 'ADMIN_REQUIRED', message: 'An active workspace owner must be set up before users can access the dashboard.' });
    }

    const [accountUser] = await db.select({ isActive: user.isActive }).from(user).where(eq(user.id, session.user.id));
    if (!accountUser?.isActive) {
      return res.status(403).json({ status: 'fail', message: 'This account is inactive. Contact an administrator.' });
    }

    const assignments = await db.select({ moduleKey: moduleAssignments.moduleKey })
      .from(moduleAssignments).where(eq(moduleAssignments.userId, session.user.id));
    const assignmentKeys = new Set(assignments.map(({ moduleKey }) => moduleKey));
    const isOwner = isOwnerEmail(session.user.email);
    const isAdmin = isOwner || assignmentKeys.has(ADMIN_ROLE)
      || (adminEmails.has(session.user.email.toLowerCase()) && !assignmentKeys.has(REVOKED_ADMIN_ROLE));
    const [first] = pathParts(req);
    const isAccessCheck = first === 'access';
    const isSettings = first === 'settings';
    const isAudit = first === 'audit';
    const license = await getLicenseStatus();
    const isLicenseManagement = first === 'settings' && pathParts(req)[1] === 'licenses';
    if (!license.isActive && !isAccessCheck && !(isAdmin && isLicenseManagement)) {
      return res.status(402).json({ status: 'fail', code: 'LICENSE_REQUIRED', message: 'An active Lyu ERP license is required to access this area.' });
    }
    let assignedModules = [];

    if (!isAdmin) {
      assignedModules = assignments.map((assignment) => assignment.moduleKey)
        .filter((moduleKey) => moduleKey !== ADMIN_ROLE && moduleKey !== REVOKED_ADMIN_ROLE);

      if (!isAccessCheck && (isSettings || (isAudit && assignedModules.length === 0))) {
        return res.status(403).json({ status: 'fail', message: 'Administrator access is required.' });
      }

      if (!isAccessCheck && isAudit && assignedModules.length > 0) {
        req.productionAuditScope = session.user.id;
      } else if (!isAccessCheck && !isAudit) {
        const moduleKey = routeModules[first];
        const authorizedModules = [...(req.method === 'GET' ? (readModules[first] || [moduleKey]) : [moduleKey])];
        if (moduleKey && moduleKey !== 'reports') authorizedModules.push('production');
        if (!moduleKey || !authorizedModules.some((module) => assignedModules.includes(module))) {
          return res.status(403).json({ status: 'fail', message: 'This production module has not been assigned to your account.' });
        }
      }
    }

    req.productionActor = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      username: session.user.username || null,
      isAdmin,
      isOwner,
      modules: isAdmin ? availableModules.map(({ key }) => key) : assignedModules,
      license,
    };

    if (isAccessCheck || isAudit || first === 'settings') return next();

    const moduleKey = routeModules[first];
    const action = auditAction(req.method);
    if (moduleKey && action) {
      const originalJson = res.json.bind(res);
      res.json = (payload) => {
        const record = payload?.data;
        req.productionAuditRecordId = req.params.id
          || req.params.code
          || (Array.isArray(record) ? record.map((item) => item?.id || item?.code || item?.orderNumber || item?.productSku).filter(Boolean) : record?.id || record?.code || record?.orderNumber || record?.productSku)
          || req.body?.id
          || null;
        if (res.statusCode < 200 || res.statusCode >= 400) return originalJson(payload);
        const recordIds = Array.isArray(req.productionAuditRecordId) ? req.productionAuditRecordId : [req.productionAuditRecordId];
        const user = req.productionActor;
        Promise.all(recordIds.map((recordId) => db.insert(productionAuditLogs).values({
            id: randomUUID(),
            userId: user.id,
            userName: user.name,
            moduleKey,
            action,
            recordId: recordId ? String(recordId).slice(0, 255) : null,
            workstationName: String(req.get('x-workstation-name') || '').trim().slice(0, 255) || null,
            details: { path: req.originalUrl.split('?')[0] },
          })))
          .then(() => originalJson(payload))
          .catch((error) => {
            console.error('Could not write production audit log:', error);
            originalJson(payload);
          });
        return res;
      };
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export function isConfiguredAdmin(email) {
  return adminEmails.has(String(email || '').trim().toLowerCase());
}
