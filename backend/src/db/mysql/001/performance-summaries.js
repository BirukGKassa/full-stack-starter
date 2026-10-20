import { mysqlTable, varchar, float, int, date, unique, timestamp } from "drizzle-orm/mysql-core";

/**
 * MODEL: machine_performance_summaries
 * PURPOSE: Stores pre-calculated OEE metrics (Availability, Performance, Quality) per machine per shift.
 * EXAMPLE: Machine "PRESS-01" on 2026-10-19 Morning Shift achieved an OEE score of 73.50%.
 */
export const machinePerformanceSummaries = mysqlTable("machine_performance_summaries", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  workCenterCode: varchar("work_center_code", { length: 50 }).notNull(), // Machine code, e.g., "PRESS-01"
  performanceDate: date("performance_date").notNull(), // Performance calendar date, e.g., "2026-10-19"
  shiftName: varchar("shift_name", { length: 50 }).notNull(), // Shift name, e.g., "Morning_Shift"
  plannedOperatingMinutes: int("planned_operating_minutes").notNull(), // Available shift time, e.g., 480
  runtimeMinutes: int("runtime_minutes").notNull(), // Actual machine runtime, e.g., 400
  downtimeMinutes: int("downtime_minutes").notNull(), // Total downtime minutes, e.g., 80
  totalUnitsProduced: float("total_units_produced").notNull(), // Total units, e.g., 500.0
  goodUnits: float("good_units").notNull(), // Good units, e.g., 490.0
  scrapUnits: float("scrap_units").notNull(), // Scrap units, e.g., 10.0
  availabilityRate: float("availability_rate").notNull(), // Availability percentage, e.g., 83.33
  performanceRate: float("performance_rate").notNull(), // Performance percentage, e.g., 90.00
  qualityRate: float("quality_rate").notNull(), // Quality percentage, e.g., 98.00
  oeeScore: float("oee_score").notNull(), // Final OEE score percentage, e.g., 73.50
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
}, (table) => ({
  uniqueShift: unique("mysql_machine_perf_shift_idx").on(table.workCenterCode, table.performanceDate, table.shiftName),
}));

/**
 * MODEL: operator_performance_summaries
 * PURPOSE: Aggregates individual operator shift productivity, active hours, and scrap rates.
 * EXAMPLE: Operator "AMH-0001" worked 6.5 hours with 75.38 units/hr productivity and 2.00% scrap rate.
 */
export const operatorPerformanceSummaries = mysqlTable("operator_performance_summaries", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  operatorId: varchar("operator_id", { length: 50 }).notNull(), // Employee ID, e.g., "AMH-0001"
  workCenterCode: varchar("work_center_code", { length: 50 }).notNull(), // Machine code, e.g., "PRESS-01"
  performanceDate: date("performance_date").notNull(), // Performance date, e.g., "2026-10-19"
  shiftName: varchar("shift_name", { length: 50 }).notNull(), // Shift name, e.g., "Morning_Shift"
  totalActiveHours: float("total_active_hours").notNull(), // Active hours logged, e.g., 6.5
  goodUnitsProduced: float("good_units_produced").notNull(), // Total good units, e.g., 490.0
  scrapUnitsProduced: float("scrap_units_produced").notNull(), // Total scrap units, e.g., 10.0
  productivityRatePerHour: float("productivity_rate_per_hour").notNull(), // Units per hour, e.g., 75.38
  scrapRatePercentage: float("scrap_rate_percentage").notNull(), // Scrap percentage, e.g., 2.00
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
}, (table) => ({
  uniqueOperatorShift: unique("mysql_operator_perf_shift_idx").on(table.operatorId, table.workCenterCode, table.performanceDate, table.shiftName),
}));