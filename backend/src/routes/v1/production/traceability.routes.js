import { Router } from 'express';
import { db, schema } from '../../../db/index.js';
import { insertAndFetch } from './data.js';

const { materialLotTraces } = schema;

const router = Router();

/**
 * ROUTE: GET /api/v1/production/traceability/lots
 * PURPOSE: Query raw material consumption lots for regulatory compliance.
 */
router.get('/lots', async (req, res) => {
  try {
    const traces = await db.select().from(materialLotTraces);
    res.status(200).json({ status: 'success', data: traces });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/traceability/lots
 * PURPOSE: Record consumed raw material batch lot numbers.
 */
router.post('/lots', async (req, res) => {
  try {
    const { manufacturingOrderId, componentSku, lotNumber, quantityUsed, unitOfMeasure } = req.body;
    const newTrace = await insertAndFetch(db, materialLotTraces, { manufacturingOrderId, componentSku, lotNumber, quantityUsed, unitOfMeasure });
    res.status(201).json({ status: 'success', data: newTrace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;