import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '../../../db/index.js';
import { insertAndFetch, updateAndFetch } from './data.js';

const { factoryTools } = schema;

const router = Router();

/**
 * ROUTE: GET /api/v1/production/tools
 * PURPOSE: List factory tools, dies, and molds.
 */
router.get('/', async (req, res) => {
  try {
    const tools = await db.select().from(factoryTools);
    res.status(200).json({ status: 'success', data: tools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/tools
 * PURPOSE: Register a new tool or mold asset.
 */
router.post('/', async (req, res) => {
  try {
    const { code, name, toolType, maxCycles, assignedWorkCenterCode } = req.body;
    const newTool = await insertAndFetch(db, factoryTools, { code, name, toolType, maxCycles, assignedWorkCenterCode });
    res.status(201).json({ status: 'success', data: newTool });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: PUT /api/v1/production/tools/:code/increment-cycles
 * PURPOSE: Increment lifecycle cycles for a tool after a run.
 */
router.put('/:code/increment-cycles', async (req, res) => {
  try {
    const { code } = req.params;
    const { cyclesToAdd } = req.body;

    const updatedTool = await updateAndFetch(db, factoryTools, eq(factoryTools.code, code), {
        currentCycles: sql`${factoryTools.currentCycles} + ${cyclesToAdd}`,
        updatedAt: new Date(),
      });

    if (!updatedTool) {
      return res.status(404).json({ status: 'fail', message: 'Tool not found' });
    }

    res.status(200).json({ status: 'success', data: updatedTool });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: PUT /api/v1/production/tools/:code/maintenance
 * PURPOSE: Record maintenance and reset servicing date for a tool.
 */
router.put('/:code/maintenance', async (req, res) => {
  try {
    const { code } = req.params;
    const servicedTool = await updateAndFetch(db, factoryTools, eq(factoryTools.code, code), {
      status: 'Active',
      lastMaintenanceDate: new Date(),
      updatedAt: new Date(),
    });

    if (!servicedTool) {
      return res.status(404).json({ status: 'fail', message: 'Tool not found' });
    }

    res.status(200).json({ status: 'success', data: servicedTool });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;