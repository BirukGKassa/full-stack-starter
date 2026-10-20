import { Router } from 'express';
import { db } from '../../../db/index.js';
import { qualityInspections } from '../../../db/postgres/index.js';

const router = Router();

/**
 * ROUTE: GET /api/v1/production/quality/inspections
 * PURPOSE: Retrieve quality test records.
 */
router.get('/inspections', async (req, res) => {
  try {
    const inspections = await db.select().from(qualityInspections);
    res.status(200).json({ status: 'success', data: inspections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/quality/inspections
 * PURPOSE: Log a quality inspection and run automated Pass/Fail check.
 */
router.post('/inspections', async (req, res) => {
  try {
    const { manufacturingOrderId, inspectorId, inspectionType, measuredValue, targetValue, lowerLimit, upperLimit, sampleSize, notes } = req.body;

    let evaluation = 'Pass';
    if (lowerLimit !== undefined && measuredValue < lowerLimit) evaluation = 'Fail';
    if (upperLimit !== undefined && measuredValue > upperLimit) evaluation = 'Fail';

    const [newInspection] = await db
      .insert(qualityInspections)
      .values({
        manufacturingOrderId,
        inspectorId,
        inspectionType,
        measuredValue,
        targetValue,
        lowerLimit,
        upperLimit,
        status: evaluation,
        sampleSize: sampleSize || 1,
        notes,
      })
      .returning();

    res.status(201).json({ status: 'success', data: newInspection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;