import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { auth } from '../../../auth.js';
import { db, schema } from '../../../db/index.js';

const { moduleAssignments, productionAuditLogs } = schema;

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

    const isAdmin = adminEmails.has(session.user.email.toLowerCase());
    const [first] = pathParts(req);
    const isAccessCheck = first === 'access';
    const isSettings = first === 'settings';
    const isAudit = first === 'audit';
    let assignedModules = [];

    if (!isAdmin && !isAccessCheck) {
      const assignments = await db.select({ moduleKey: moduleAssignments.moduleKey })
        .from(moduleAssignments)
        .where(eq(moduleAssignments.userId, session.user.id));
      assignedModules = assignments.map((assignment) => assignment.moduleKey);

      if (isSettings || (isAudit && assignedModules.length === 0)) {
        return res.status(403).json({ status: 'fail', message: 'Administrator access is required.' });
      }

      if (isAudit && assignedModules.length > 0) {
        req.productionAuditScope = session.user.id;
      } else if (!isAudit) {
        const moduleKey = routeModules[first];
        const authorizedModules = req.method === 'GET' ? (readModules[first] || [moduleKey]) : [moduleKey];
        if (!moduleKey || !authorizedModules.some((module) => assignedModules.includes(module))) {
          return res.status(403).json({ status: 'fail', message: 'This production module has not been assigned to your account.' });
        }
      }
    }

    req.productionActor = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      isAdmin,
      modules: isAdmin ? Object.values(routeModules).filter((module, index, all) => all.indexOf(module) === index) : assignedModules,
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
  return adminEmails.has(String(email || '').toLowerCase());
}
