import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { desc, eq, inArray } from 'drizzle-orm';
import { auth } from '../../../auth.js';
import { db, schema } from '../../../db/index.js';

const { moduleAssignments, productionAuditLogs, user } = schema;
const router = Router();

const availableModules = [
  { key: 'overview', label: 'Production overview' },
  { key: 'production', label: 'Production entry' },
  { key: 'downtime', label: 'Machine downtime' },
  { key: 'products', label: 'Products and BOMs' },
  { key: 'orders', label: 'Manufacturing orders' },
  { key: 'machines', label: 'Machines and tools' },
  { key: 'quality', label: 'Quality and traceability' },
  { key: 'reports', label: 'Reports' },
];
const moduleKeys = new Set(availableModules.map(({ key }) => key));

function requestHeaders(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return headers;
}

function requireAdmin(req, res) {
  if (req.productionActor?.isAdmin) return true;
  res.status(403).json({ status: 'fail', message: 'Administrator access is required.' });
  return false;
}

router.get('/access', async (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.productionActor,
      modules: req.productionActor.isAdmin ? availableModules.map(({ key }) => key) : req.productionActor.modules,
      availableModules: req.productionActor.isAdmin ? availableModules : undefined,
    },
  });
});

router.get('/settings/users', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [users, assignments] = await Promise.all([
      db.select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }).from(user),
      db.select().from(moduleAssignments),
    ]);
    res.json({ status: 'success', data: { users, assignments, modules: availableModules } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/settings/users', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.temporaryPassword || '');
    const modules = [...new Set(Array.isArray(req.body.modules) ? req.body.modules : [])];

    if (name.length < 2 || name.length > 255) {
      return res.status(400).json({ status: 'fail', message: 'Name must be between 2 and 255 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: 'fail', message: 'Enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ status: 'fail', message: 'Temporary password must be between 8 and 128 characters.' });
    }
    if (modules.some((module) => !moduleKeys.has(module))) {
      return res.status(400).json({ status: 'fail', message: 'One or more selected modules are invalid.' });
    }

    const result = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: requestHeaders(req),
    });
    const createdUser = result?.user;
    if (!createdUser?.id) {
      return res.status(500).json({ status: 'error', message: 'Account creation did not return a user record.' });
    }

    if (modules.length > 0) {
      await db.insert(moduleAssignments).values(modules.map((moduleKey) => ({
        id: randomUUID(),
        userId: createdUser.id,
        moduleKey,
        assignedBy: req.productionActor.id,
      })));
    }

    res.status(201).json({
      status: 'success',
      data: {
        user: { id: createdUser.id, name: createdUser.name, email: createdUser.email },
        assignments: modules,
      },
    });
  } catch (error) {
    const message = error?.body?.message || error.message || 'Could not create user.';
    res.status(400).json({ status: 'error', message });
  }
});

router.put('/settings/users/:userId/modules', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const modules = [...new Set(Array.isArray(req.body.modules) ? req.body.modules : [])];
    if (modules.some((module) => !moduleKeys.has(module))) {
      return res.status(400).json({ status: 'fail', message: 'One or more selected modules are invalid.' });
    }
    const [targetUser] = await db.select({ id: user.id }).from(user).where(eq(user.id, req.params.userId));
    if (!targetUser) return res.status(404).json({ status: 'fail', message: 'User not found.' });

    await db.transaction(async (tx) => {
      await tx.delete(moduleAssignments).where(eq(moduleAssignments.userId, targetUser.id));
      if (modules.length > 0) {
        await tx.insert(moduleAssignments).values(modules.map((moduleKey) => ({
          id: randomUUID(),
          userId: targetUser.id,
          moduleKey,
          assignedBy: req.productionActor.id,
        })));
      }
    });
    res.json({ status: 'success', data: { userId: targetUser.id, modules } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/audit', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const filters = req.productionActor.isAdmin
      ? db.select().from(productionAuditLogs)
      : db.select().from(productionAuditLogs).where(inArray(productionAuditLogs.moduleKey, req.productionActor.modules));
    const records = await filters.orderBy(desc(productionAuditLogs.createdAt)).limit(limit);
    res.json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
