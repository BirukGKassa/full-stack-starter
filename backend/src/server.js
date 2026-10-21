import express from 'express';
import './config.js';
import cors from 'cors';
import { randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { db, pool, schema } from './db/index.js';
import { eq, or } from 'drizzle-orm';
import systemRoutes, { recordSystemEvent } from './routes/system.routes.js';
import { startLicenseRefreshTimer } from './system/license.js';


import newsRoutes from "./routes/newsRoutes.js";
import bomsRoutes from "./routes/v1/production/boms.routes.js";
import workCentersRoutes from "./routes/v1/production/work-centers.routes.js";
import manufacturingOrdersRoutes from "./routes/v1/production/manufacturing-orders.routes.js";
import productionLogsRoutes from "./routes/v1/production/production-logs.routes.js";
import downtimeRoutes from "./routes/v1/production/downtime.routes.js";
import qualityRoutes from "./routes/v1/production/quality.routes.js";
import toolsRoutes from "./routes/v1/production/tools.routes.js";
import traceabilityRoutes from "./routes/v1/production/traceability.routes.js";
import analyticsRoutes from "./routes/v1/production/analytics.routes.js";
import settingsRoutes from "./routes/v1/production/settings.routes.js";
import { productionAccess } from "./routes/v1/production/access.js";


const app = express();
const PORT = Number(process.env.PORT || 3005);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const adminEmails = new Set((process.env.LYU_ADMIN_EMAILS || '')
  .split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));

function configuredAdminSetupToken() {
  const setupLink = String(process.env.REGISTER_ADMIN_LINK || '').trim();
  if (!setupLink) return '';
  try {
    const url = new URL(setupLink, process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`);
    return url.searchParams.get('setup') || url.searchParams.get('token') || '';
  } catch {
    return setupLink;
  }
}

function secureTokenMatch(candidate, configured) {
  if (!candidate || !configured) return false;
  const candidateHash = createHash('sha256').update(candidate).digest();
  const configuredHash = createHash('sha256').update(configured).digest();
  return timingSafeEqual(candidateHash, configuredHash);
}

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.once('finish', () => {
    if (res.statusCode >= 500) {
      const segments = req.originalUrl.split('?')[0].split('/').filter(Boolean);
      recordSystemEvent({
        level: 'error',
        category: segments.slice(2, 4).join('/') || 'system',
        message: `${req.method} request failed with status ${res.statusCode}`,
        path: req.originalUrl.split('?')[0],
        statusCode: res.statusCode,
        details: { durationMs: Date.now() - startedAt },
      });
    }
  });
  next();
});

// Better Auth must receive the request before express.json() consumes the body.
app.post('/api/auth/sign-in/identifier', express.json(), async (req, res, next) => {
  try {
    const identifier = String(req.body.identifier || '').trim();
    const password = String(req.body.password || '');
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Enter your email, username, or employee ID and password.' });
    }
    const normalizedIdentifier = identifier.toLowerCase();
    let [account] = await db.select({ email: schema.user.email }).from(schema.user)
      .where(eq(schema.user.email, normalizedIdentifier));
    if (!account) {
      [account] = await db.select({ email: schema.user.email }).from(schema.user)
        .where(eq(schema.user.username, normalizedIdentifier));
    }
    if (!account) {
      [account] = await db.select({ email: schema.user.email }).from(schema.user)
        .where(eq(schema.user.employeeId, identifier));
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(', '));
    }
    headers.set('content-type', 'application/json');
    const authUrl = new URL('/api/auth/sign-in/email', process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`);
    const authResponse = await auth.handler(new Request(authUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: account?.email || identifier, password }),
    }));
    authResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') res.setHeader(key, value);
    });
    if (authResponse.headers.getSetCookie) {
      res.setHeader('set-cookie', authResponse.headers.getSetCookie());
    } else if (authResponse.headers.get('set-cookie')) {
      res.setHeader('set-cookie', authResponse.headers.get('set-cookie'));
    }
    res.status(authResponse.status).send(Buffer.from(await authResponse.arrayBuffer()));
  } catch (error) {
    next(error);
  }
});
app.post('/api/bootstrap/admin', express.json(), async (req, res, next) => {
  try {
    const token = String(req.body.setupToken || '');
    const email = String(req.body.email || '').trim().toLowerCase();
    const username = String(req.body.username || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim();
    const password = String(req.body.password || '');
    const setupToken = configuredAdminSetupToken();
    if (!secureTokenMatch(token, setupToken)) return res.status(403).json({ message: 'Administrator setup link is invalid.' });
    if (adminEmails.size === 0) return res.status(503).json({ message: 'Set LYU_ADMIN_EMAILS before using initial administrator setup.' });
    if (!adminEmails.has(email)) return res.status(403).json({ message: 'This email is not listed in LYU_ADMIN_EMAILS.' });
    if (name.length < 2 || name.length > 255 || !/^[a-z0-9_.]{3,30}$/.test(username) || password.length < 12 || password.length > 128) {
      return res.status(400).json({ message: 'Enter a valid name, username, and password of at least 12 characters.' });
    }
    const existingAdmins = await db.select({ id: schema.user.id }).from(schema.user).where(or(
      ...[...adminEmails].map((adminEmail) => eq(schema.user.email, adminEmail)),
    ));
    if (existingAdmins.length) return res.status(409).json({ message: 'Initial administrator setup has already been completed.' });
    const authContext = await auth.$context;
    const passwordHash = await authContext.password.hash(password);
    await db.transaction(async (tx) => {
      const id = randomUUID();
      await tx.insert(schema.user).values({
        id,
        name,
        email,
        username,
        displayUsername: username,
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await tx.insert(schema.account).values({
        id: randomUUID(),
        accountId: id,
        providerId: 'credential',
        userId: id,
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    res.status(201).json({ status: 'success', message: 'Administrator account created. Sign in to continue.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
      return res.status(409).json({ message: 'That email or username is already in use.' });
    }
    next(error);
  }
});
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.json());

// Register routes
app.use('/api/news', newsRoutes);
app.use(systemRoutes);
app.use('/api/v1/production', productionAccess);
app.use('/api/v1/production', settingsRoutes);
app.use("/api/v1/production/boms", bomsRoutes);
app.use('/api/v1/production/work-centers', workCentersRoutes);
app.use('/api/v1/production/manufacturing-orders', manufacturingOrdersRoutes);
app.use('/api/v1/production/production-logs', productionLogsRoutes);
app.use('/api/v1/production/downtime', downtimeRoutes);
app.use('/api/v1/production/quality', qualityRoutes);
app.use('/api/v1/production/tools', toolsRoutes);
app.use('/api/v1/production/traceability', traceabilityRoutes);
app.use('/api/v1/production/analytics', analyticsRoutes);


app.get('/api/session', async (req, res, next) => {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(', '));
    }

    const session = await auth.api.getSession({ headers });
    if (!session) return res.status(401).json({ user: null });
    return res.json(session);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    if (process.env.DB_TYPE === 'pg') await pool.query('select 1');
    else await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/', (req, res) => {
  res.json({ name: process.env.APP_NAME || 'Lyu ERP', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startLicenseRefreshTimer();