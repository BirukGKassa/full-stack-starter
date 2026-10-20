import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { workCenters } from '../../../db/postgres/index.js';

const router = Router();

/**
 * ROUTE: GET /api/v1/production/work-centers
 * PURPOSE: List all factory work centers.
 */
router.get('/', async (req, res) => {
  try {
    const centers = await db.select().from(workCenters);
    res.status(200).json({ status: 'success', data: centers });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/work-centers
 * PURPOSE: Register a new machine or production line asset.
 */
router.post('/', async (req, res) => {
  try {
    const { code, name, factoryType, plantId, costPerHour, nominalSpeed, speedUnit, metadata } = req.body;

    const [newCenter] = await db
      .insert(workCenters)
      .values({
        code,
        name,
        factoryType,
        plantId: plantId || 'PLANT-01',
        costPerHour: costPerHour || 0.0,
        nominalSpeed: nominalSpeed || 0.0,
        speedUnit,
        metadata,
      })
      .returning();

    res.status(201).json({ status: 'success', data: newCenter });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: GET /api/v1/production/work-centers/:code
 * PURPOSE: Fetch specific work center details by code.
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const [center] = await db.select().from(workCenters).where(eq(workCenters.code, code));

    if (!center) {
      return res.status(404).json({ status: 'fail', message: 'Work center not found' });
    }

    res.status(200).json({ status: 'success', data: center });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: PUT /api/v1/production/work-centers/:code
 * PURPOSE: Update machine specs, status, or hourly cost rates.
 */
router.put('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const updateFields = req.body;

    const [updated] = await db
      .update(workCenters)
      .set({ ...updateFields, updatedAt: new Date() })
      .where(eq(workCenters.code, code))
      .returning();

    if (!updated) {
      return res.status(404).json({ status: 'fail', message: 'Work center not found' });
    }

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;