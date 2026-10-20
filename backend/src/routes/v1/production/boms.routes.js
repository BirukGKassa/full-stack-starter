import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../../db/index.js';
import { insertAndFetch, updateAndFetch } from './data.js';

const { boms, bomLines } = schema;

const router = Router();

/**
 * ROUTE: GET /api/v1/production/boms
 * PURPOSE: Retrieve a paginated list of all active BOM recipes.
 */
router.get('/', async (req, res) => {
  try {
    // 1. Fetch active BOM records from database
    const result = await db.select().from(boms).where(eq(boms.isActive, true));
    
    // 2. Return structured operational response
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: POST /api/v1/production/boms
 * PURPOSE: Create a new BOM master recipe along with its component lines.
 */
router.post('/', async (req, res) => {
  try {
    const { productSku, productName, outputQty, outputUnit, standardRunMinutes, lines, metadata } = req.body;

    // 1. Insert master BOM and lines atomically using a transaction
    const newBom = await db.transaction(async (tx) => {
      const insertedBom = await insertAndFetch(tx, boms, {
        productSku,
        productName,
        outputQty,
        outputUnit,
        standardRunMinutes,
        metadata,
      });

      if (lines && lines.length > 0) {
        const formattedLines = lines.map((line) => ({
          id: randomUUID(),
          bomId: insertedBom.id,
          componentSku: line.componentSku,
          componentName: line.componentName,
          quantityReq: line.quantityReq,
          unitOfMeasure: line.unitOfMeasure,
          unitCost: line.unitCost || 0.0,
          scrapFactor: line.scrapFactor || 0.0,
        }));
        await tx.insert(bomLines).values(formattedLines);
      }

      return insertedBom;
    });

    // 2. Return success response
    res.status(201).json({ status: 'success', data: newBom });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: GET /api/v1/production/boms/:id
 * PURPOSE: Fetch a specific BOM recipe by ID, including components.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch target BOM and its component lines
    const [bom] = await db.select().from(boms).where(eq(boms.id, id));
    if (!bom) {
      return res.status(404).json({ status: 'fail', message: 'BOM not found' });
    }
    const components = await db.select().from(bomLines).where(eq(bomLines.bomId, id));

    // 2. Return structured response
    res.status(200).json({ status: 'success', data: { ...bom, lines: components } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: PUT /api/v1/production/boms/:id
 * PURPOSE: Update BOM details or metadata.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Update record in database
    const updatedBom = await updateAndFetch(db, boms, eq(boms.id, id), { ...updateData, updatedAt: new Date() });

    if (!updatedBom) {
      return res.status(404).json({ status: 'fail', message: 'BOM not found' });
    }

    // 2. Return success response
    res.status(200).json({ status: 'success', data: updatedBom });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * ROUTE: DELETE /api/v1/production/boms/:id
 * PURPOSE: Soft-delete/archive a BOM recipe.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Soft-delete by toggling isActive flag
    const deactivated = await updateAndFetch(db, boms, eq(boms.id, id), { isActive: false, updatedAt: new Date() });

    if (!deactivated) {
      return res.status(404).json({ status: 'fail', message: 'BOM not found' });
    }

    // 2. Return response
    res.status(200).json({ status: 'success', message: 'BOM successfully deactivated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;