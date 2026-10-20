import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { db, dbType, schema } from '../../../db/index.js';
import { insertAndFetch } from './data.js';

const { machineProductionLogs, manufacturingOrders, materialLotTraces, machineDowntimeLogs } = schema;

const router = Router();

/**
 * ROUTE: GET /api/v1/production/production-logs
 * PURPOSE: Retrieve shop floor output logs with filters.
 */
router.get('/', async (req, res) => {
  try {
    const logs = await db.select().from(machineProductionLogs);
    res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/production-logs
 * PURPOSE: Processes the production clerk's machine-side shift report. 
 * Captures operator ID, output, scrap, material consumption, AND machine downtime atomically.
 */
router.post('/', async (req, res) => {
  try {
    const {
      manufacturingOrderId,
      workCenterCode,
      operatorId,
      shiftName,
      startTime,
      endTime,
      durationMinutes,
      outputQuantity,
      outputUnit,
      scrapQuantity,
      machineDowntime,   // Optional: Downtime object reported at the machine
      materialLotUsed,   // Optional: Material lot trace object
      notes,
    } = req.body;

    // Execute all updates and inserts in a single atomic transaction
    const transactionResult = await db.transaction(async (tx) => {
      // 1. Insert machine production log (tied to work center and operator)
      const insertedLog = await insertAndFetch(tx, machineProductionLogs, {
          manufacturingOrderId,
          workCenterCode,
          operatorId,
          shiftName,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          durationMinutes,
          outputQuantity,
          outputUnit,
          scrapQuantity: scrapQuantity || 0.0,
          notes,
        });

      // 2. If the clerk reported machine downtime during this session, record it directly against the work center
      if (machineDowntime && machineDowntime.downtimeReasonId) {
        const downtimeMinutes = machineDowntime.downtimeMinutes || 0;
        const stoppageStart = new Date(startTime);
        const stoppageEnd = new Date(stoppageStart.getTime() + downtimeMinutes * 60000);

        await tx.insert(machineDowntimeLogs).values({
          ...(dbType === 'mysql' ? { id: randomUUID(), companyId: req.body.companyId || 'DEFAULT' } : {}),
          workCenterCode,
          downtimeReasonId: machineDowntime.downtimeReasonId,
          startTime: stoppageStart,
          endTime: stoppageEnd,
          durationMinutes: downtimeMinutes,
          technicianId: machineDowntime.technicianId || null,
          isVerified: true, // Clerk-submitted shift log verifies the downtime
          notes: machineDowntime.notes || "Recorded via clerk machine shift log",
        });
      }

      // 3. Record raw material lot consumption if provided
      if (materialLotUsed && materialLotUsed.lotNumber) {
        await tx.insert(materialLotTraces).values({
          id: randomUUID(),
          manufacturingOrderId,
          componentSku: materialLotUsed.componentSku,
          lotNumber: materialLotUsed.lotNumber,
          quantityUsed: materialLotUsed.quantityUsed,
          unitOfMeasure: materialLotUsed.unitOfMeasure || outputUnit,
        });
      }

      // 4. Update parent manufacturing order cumulative totals
      await tx
        .update(manufacturingOrders)
        .set({
          producedQty: sql`${manufacturingOrders.producedQty} + ${outputQuantity}`,
          scrapQty: sql`${manufacturingOrders.scrapQty} + ${scrapQuantity || 0.0}`,
          updatedAt: new Date(),
        })
        .where(eq(manufacturingOrders.id, manufacturingOrderId));

      return insertedLog;
    });

    res.status(201).json({
      status: 'success',
      message: 'Machine shift log, material trace, and machine downtime recorded successfully',
      data: transactionResult,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;