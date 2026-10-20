import express from 'express';
import './config.js';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { pool } from './db/index.js';

import newsRoutes from "./routes/newsRoutes.js"

const app = express();
const PORT = Number(process.env.PORT || 3005);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: frontendUrl, credentials: true }));

// Better Auth must receive the request before express.json() consumes the body.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

// Register routes
app.use('/api/news', newsRoutes);

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
    res.json({ status: 'ok', database: 'connected' , databaseLink: process.env.DATABASE_URL || "unknown" });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/', (req, res) => {
  res.json({ name: process.env.APP_NAME || 'Better Auth Express Starter', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});