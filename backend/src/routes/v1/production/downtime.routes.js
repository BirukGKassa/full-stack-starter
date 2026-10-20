import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { downtimeReasons, machineDowntimeLogs } from '../../../db/postgres/index.js';

const router = Router();

/**
 * ROUTE: GET /api/v1/production/downtime/reasons
 * PURPOSE: List all downtime reason lookup codes.
 */
router.get('/reasons', async (req, res) => {
  try {
    const reasons = await db.select().from(downtimeReasons).where(eq(downtimeReasons.isActive, true));
    res.status(200).json({ status: 'success', data: reasons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/downtime/reasons
 * PURPOSE: Create a new downtime reason code.
 */
router.post('/reasons', async (req, res) => {
  try {
    const { category, reasonCode, description, requiresTechnician } = req.body;
    const [newReason] = await db
      .insert(downtimeReasons)
      .values({ category, reasonCode, description, requiresTechnician: requiresTechnician || false })
      .returning();
    res.status(201).json({ status: 'success', data: newReason });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: GET /api/v1/production/downtime/logs
 * PURPOSE: List machine downtime logs.
 */
router.get('/logs', async (req, res) => {
  try {
    const logs = await db.select().from(machineDowntimeLogs);
    res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/downtime/logs
 * PURPOSE: Record a machine stoppage event.
 */
router.post('/logs', async (req, res) => {
  try {
    const { workCenterCode, downtimeReasonId, startTime, technicianId, notes } = req.body;
    const [newLog] = await db
      .insert(machineDowntimeLogs)
      .values({ workCenterCode, downtimeReasonId, startTime: new Date(startTime), technicianId, notes })
      .returning();
    res.status(201).json({ status: 'success', data: newLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: PUT /api/v1/production/downtime/logs/:id/resolve
 * PURPOSE: Close and resolve an active downtime stoppage log.
 */
router.put('/logs/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, notes } = req.body;

    const [existingLog] = await db.select().from(machineDowntimeLogs).where(eq(machineDowntimeLogs.id, id));
    if (!existingLog) {
      return res.status(404).json({ status: 'fail', message: 'Downtime log not found' });
    }

    const start = new Date(existingLog.startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMinutes = Math.round((end - start) / (1000 * 60));

    const [resolved] = await db
      .update(machineDowntimeLogs)
      .set({ endTime: new Date(endTime), durationMinutes, isVerified: true, notes: notes || existingLog.notes })
      .where(eq(machineDowntimeLogs.id, id))
      .returning();

    res.status(200).json({ status: 'success', data: resolved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;