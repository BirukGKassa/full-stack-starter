import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db, dbType, schema } from '../../../db/index.js';
import { insertAndFetch, updateAndFetch } from './data.js';

const { manufacturingOrders, machineProductionLogs } = schema;

const router = Router();

/**
 * ROUTE: GET /api/v1/production/manufacturing-orders
 * PURPOSE: List all work orders.
 */
router.get('/', async (req, res) => {
  try {
    const orders = await db.select().from(manufacturingOrders);
    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/manufacturing-orders
 * PURPOSE: Create a new manufacturing work order.
 */
router.post('/', async (req, res) => {
  try {
    const { orderNumber, bomId, productSku, targetQuantity, priority, batchNumber, dueDate, notes } = req.body;

    const newOrder = await insertAndFetch(db, manufacturingOrders, {
        ...(dbType === 'mysql' ? { companyId: req.body.companyId || 'DEFAULT' } : {}),
        orderNumber,
        bomId,
        productSku,
        targetQuantity,
        priority: priority || 'Normal',
        batchNumber,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
      });

    res.status(201).json({ status: 'success', data: newOrder });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: GET /api/v1/production/manufacturing-orders/:id
 * PURPOSE: Fetch order details by ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [order] = await db.select().from(manufacturingOrders).where(eq(manufacturingOrders.id, id));

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Manufacturing order not found' });
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: PUT /api/v1/production/manufacturing-orders/:id/status
 * PURPOSE: Update the lifecycle state of a manufacturing order.
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatePayload = { status, updatedAt: new Date() };
    if (status === 'In Progress') updatePayload.startedAt = new Date();
    if (status === 'Completed') updatePayload.completedAt = new Date();

    const updatedOrder = await updateAndFetch(db, manufacturingOrders, eq(manufacturingOrders.id, id), updatePayload);

    if (!updatedOrder) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    res.status(200).json({ status: 'success', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: GET /api/v1/production/manufacturing-orders/:id/progress
 * PURPOSE: Retrieves real-time production metrics, totals, remaining quantity, and shift breakdown.
 * PARAMS: 
 *   - id: UUID of the manufacturing order
 */
router.get('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch manufacturing order target and current status
    const [order] = await db.select().from(manufacturingOrders).where(eq(manufacturingOrders.id, id));
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    // 2. Aggregate shop-floor production logs grouped by date and shift
    const shiftLogs = await db
      .select({
        productionDate: sql`DATE(${machineProductionLogs.startTime})`,
        shiftName: machineProductionLogs.shiftName,
        shiftOutput: sql`SUM(${machineProductionLogs.outputQuantity})`,
        shiftScrap: sql`SUM(${machineProductionLogs.scrapQuantity})`,
      })
      .from(machineProductionLogs)
      .where(eq(machineProductionLogs.manufacturingOrderId, id))
      .groupBy(sql`DATE(${machineProductionLogs.startTime})`, machineProductionLogs.shiftName);

    const totalProduced = shiftLogs.reduce((acc, row) => acc + Number(row.shiftOutput || 0), 0);
    const totalScrap = shiftLogs.reduce((acc, row) => acc + Number(row.shiftScrap || 0), 0);
    const remainingQuantity = Math.max(0, order.targetQuantity - totalProduced);
    const completionPercentage = ((totalProduced / order.targetQuantity) * 100).toFixed(2);

    // 3. Return structured operational response
    res.status(200).json({
      status: 'success',
      data: {
        orderNumber: order.orderNumber,
        productSku: order.productSku,
        orderStatus: order.status,
        targetQuantity: order.targetQuantity,
        totalProduced,
        totalScrap,
        remainingQuantity,
        completionPercentage: `${completionPercentage}%`,
        shiftBreakdown: shiftLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;