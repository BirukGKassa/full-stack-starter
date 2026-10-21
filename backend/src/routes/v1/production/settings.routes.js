import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { auth } from '../../../auth.js';
import { db, schema } from '../../../db/index.js';
import { isConfiguredAdmin } from './access.js';
import { availableModules } from './modules.js';

const { account, moduleAssignments, productionAuditLogs, session, user } = schema;
const router = Router();

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
    const users = await db.select({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      employeeId: user.employeeId,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }).from(user);
    const userIds = users.map((item) => item.id);
    const [assignments, sessions] = await Promise.all([
      db.select().from(moduleAssignments),
      userIds.length
        ? db.select({
            userId: session.userId,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
          }).from(session).where(inArray(session.userId, userIds))
        : Promise.resolve([]),
    ]);
    const now = Date.now();
    const sessionSummary = new Map();
    for (const item of sessions) {
      const summary = sessionSummary.get(item.userId) || { activeCount: 0, lastSessionAt: null };
      if (new Date(item.expiresAt).getTime() > now) summary.activeCount += 1;
      if (!summary.lastSessionAt || new Date(item.createdAt) > new Date(summary.lastSessionAt)) {
        summary.lastSessionAt = item.createdAt;
      }
      sessionSummary.set(item.userId, summary);
    }
    const usersWithSessions = users.map((item) => ({
      ...item,
      session: sessionSummary.get(item.id) || { activeCount: 0, lastSessionAt: null },
    }));
    res.json({ status: 'success', data: { users: usersWithSessions, assignments, modules: availableModules } });
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
    const employeeId = String(req.body.employeeId || '').trim();
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
    if (employeeId.length > 50) {
      return res.status(400).json({ status: 'fail', message: 'Employee ID must be 50 characters or fewer.' });
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
        employeeId: employeeId || null,
        isActive: true,
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
        user: { id: createdUser.id, name: createdUser.name, username: createdUser.username, email: createdUser.email, employeeId: createdUser.employeeId, isActive: createdUser.isActive },
        assignments: modules,
      },
    });
  } catch (error) {
    console.error('Could not create production user:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
      return res.status(409).json({ status: 'fail', message: 'That email, username, or employee ID is already in use.' });
    }
    const message = error?.body?.message || error.message || 'Could not create user.';
    res.status(500).json({ status: 'error', message });
  }
});

router.put('/settings/users/:userId/active', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ status: 'fail', message: 'isActive must be a boolean.' });
    }
    const [targetUser] = await db.select({ id: user.id, email: user.email }).from(user).where(eq(user.id, req.params.userId));
    if (!targetUser) return res.status(404).json({ status: 'fail', message: 'User not found.' });
    if (!req.body.isActive && (targetUser.id === req.productionActor.id || isConfiguredAdmin(targetUser.email))) {
      return res.status(400).json({ status: 'fail', message: 'Administrator accounts cannot be deactivated here.' });
    }

    await db.transaction(async (tx) => {
      await tx.update(user).set({ isActive: req.body.isActive, updatedAt: new Date() }).where(eq(user.id, targetUser.id));
      if (!req.body.isActive) {
        await tx.delete(session).where(eq(session.userId, targetUser.id));
      }
    });
    res.json({ status: 'success', data: { userId: targetUser.id, isActive: req.body.isActive } });
  } catch (error) {
    console.error('Could not update production user status:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/settings/users/:userId/password', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const password = String(req.body.temporaryPassword || '');
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ status: 'fail', message: 'Temporary password must be between 8 and 128 characters.' });
    }
    const [targetUser] = await db.select({ id: user.id }).from(user).where(eq(user.id, req.params.userId));
    if (!targetUser) return res.status(404).json({ status: 'fail', message: 'User not found.' });
    const [credential] = await db.select({ id: account.id }).from(account)
      .where(and(eq(account.userId, targetUser.id), eq(account.providerId, 'credential')));
    if (!credential) return res.status(404).json({ status: 'fail', message: 'No password-based account was found for this user.' });

    const authContext = await auth.$context;
    const passwordHash = await authContext.password.hash(password);
    await db.transaction(async (tx) => {
      await tx.update(account).set({ password: passwordHash, updatedAt: new Date() })
        .where(and(eq(account.userId, targetUser.id), eq(account.providerId, 'credential')));
      await tx.delete(session).where(eq(session.userId, targetUser.id));
    });
    res.json({ status: 'success', data: { userId: targetUser.id } });
  } catch (error) {
    console.error('Could not reset production user password:', error);
    res.status(500).json({ status: 'error', message: error.message });
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
