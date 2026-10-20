import { Router } from 'express';
import { eq, and, gte, lte } from 'drizzle-orm';
import { db, schema } from '../../../db/index.js';

const { machinePerformanceSummaries, operatorPerformanceSummaries } = schema;

const router = Router();

/**
 * ROUTE: GET /api/v1/production/analytics/machine-oee
 * PURPOSE: Retrieve OEE metrics (Availability, Performance, Quality, OEE Score).
 */
router.get('/machine-oee', async (req, res) => {
  try {
    const oeeData = await db.select().from(machinePerformanceSummaries);
    res.status(200).json({ status: 'success', data: oeeData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ROUTE: GET /api/v1/production/analytics/operator-performance
 * PURPOSE: Query operator performance and productivity rate across a date range.
 * PARAMS (Query):
 *   - operatorId: ID of the operator
 *   - startDate: Start date (YYYY-MM-DD)
 *   - endDate: End date (YYYY-MM-DD)
 */
router.get('/operator-performance', async (req, res) => {
  try {
    const { operatorId, startDate, endDate } = req.query;

    if (!operatorId || !startDate || !endDate) {
      return res.status(400).json({ status: 'fail', message: 'Missing operatorId, startDate, or endDate query parameters' });
    }

    const rows = await db
      .select()
      .from(operatorPerformanceSummaries)
      .where(
        and(
          eq(operatorPerformanceSummaries.operatorId, operatorId),
          gte(operatorPerformanceSummaries.performanceDate, startDate),
          lte(operatorPerformanceSummaries.performanceDate, endDate)
        )
      );

    const totalActiveHours = rows.reduce((acc, r) => acc + Number(r.totalActiveHours || 0), 0);
    const totalGoodUnits = rows.reduce((acc, r) => acc + Number(r.goodUnitsProduced || 0), 0);
    const totalScrapUnits = rows.reduce((acc, r) => acc + Number(r.scrapUnitsProduced || 0), 0);
    const totalUnits = totalGoodUnits + totalScrapUnits;

    const avgProductivity = totalActiveHours > 0 ? (totalGoodUnits / totalActiveHours).toFixed(2) : 0;
    const overallScrapRate = totalUnits > 0 ? ((totalScrapUnits / totalUnits) * 100).toFixed(2) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        operatorId,
        dateRange: { startDate, endDate },
        summary: {
          totalActiveHours: Number(totalActiveHours.toFixed(2)),
          totalGoodUnitsProduced: totalGoodUnits,
          totalScrapUnitsProduced: totalScrapUnits,
          averageProductivityPerHour: Number(avgProductivity),
          overallScrapRatePercentage: `${overallScrapRate}%`,
        },
        shiftBreakdown: rows,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;