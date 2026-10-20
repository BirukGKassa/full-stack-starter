import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { desc, eq, inArray } from 'drizzle-orm';
import { auth } from '../../../auth.js';
import { db, schema } from '../../../db/index.js';

const { account, moduleAssignments, productionAuditLogs, user } = schema;
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
      db.select({ id: user.id, name: user.name, username: user.username, email: user.email, createdAt: user.createdAt }).from(user),
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
    const username = String(req.body.username || '').trim().toLowerCase();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.temporaryPassword || '');
    const modules = [...new Set(Array.isArray(req.body.modules) ? req.body.modules : [])];

    if (name.length < 2 || name.length > 255) {
      return res.status(400).json({ status: 'fail', message: 'Name must be between 2 and 255 characters.' });
    }
    if (!/^[a-z0-9_.]{3,30}$/.test(username)) {
      return res.status(400).json({ status: 'fail', message: 'Username must be 3–30 characters using letters, numbers, dots, or underscores.' });
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

    const authContext = await auth.$context;
    if (await authContext.internalAdapter.findUserByEmail(email)) {
      return res.status(409).json({ status: 'fail', message: 'An account with this email already exists.' });
    }
    const existingUsername = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
    if (existingUsername.length) {
      return res.status(409).json({ status: 'fail', message: 'That username is already in use.' });
    }

    const passwordHash = await authContext.password.hash(password);
    const createdUser = await db.transaction(async (tx) => {
      const newUser = {
        id: randomUUID(),
        name,
        email,
        username,
        displayUsername: username,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await tx.insert(user).values(newUser);
      await tx.insert(account).values({
        id: randomUUID(),
        accountId: newUser.id,
        providerId: 'credential',
        userId: newUser.id,
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (modules.length > 0) {
        await tx.insert(moduleAssignments).values(modules.map((moduleKey) => ({
          id: randomUUID(),
          userId: newUser.id,
          moduleKey,
          assignedBy: req.productionActor.id,
        })));
      }
      return newUser;
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: { id: createdUser.id, name: createdUser.name, username: createdUser.username, email: createdUser.email },
        assignments: modules,
      },
    });
  } catch (error) {
    console.error('Could not create production user:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
      return res.status(409).json({ status: 'fail', message: 'That email or username is already in use.' });
    }
    const message = error?.body?.message || error.message || 'Could not create user.';
    res.status(500).json({ status: 'error', message });
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
