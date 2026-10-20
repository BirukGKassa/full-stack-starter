import express from 'express';
import './config.js';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { pool } from './db/index.js';


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


const app = express();
const PORT = Number(process.env.PORT || 3005);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: frontendUrl, credentials: true }));

// Better Auth must receive the request before express.json() consumes the body.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());


// Register routes
app.use('/api/news', newsRoutes);
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