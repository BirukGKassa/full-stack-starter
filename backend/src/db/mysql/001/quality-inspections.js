import { mysqlTable, varchar, float, int, timestamp } from "drizzle-orm/mysql-core";

/**
 * MODEL: quality_inspections
 * PURPOSE: Logs physical quality measurements and test results against regulatory and product specifications.
 * EXAMPLE: Inspection "thickness" measured at 1.83mm (target 1.80mm, range 1.75-1.85mm), status "Pass".
 */
export const qualityInspections = mysqlTable("quality_inspections", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  manufacturingOrderId: varchar("manufacturing_order_id", { length: 36 }).notNull(), // Work order reference ID
  inspectorId: varchar("inspector_id", { length: 50 }).notNull(), // QA staff ID, e.g., "INS-01"
  inspectionType: varchar("inspection_type", { length: 50 }).notNull(), // Test type, e.g., "thickness", "burst_test"
  measuredValue: float("measured_value").notNull(), // Actual physical reading, e.g., 1.83
  targetValue: float("target_value").notNull(), // Ideal baseline spec, e.g., 1.80
  lowerLimit: float("lower_limit"), // Minimum tolerance boundary, e.g., 1.75
  upperLimit: float("upper_limit"), // Maximum tolerance boundary, e.g., 1.85
  status: varchar("status", { length: 50 }).notNull(), // Evaluation result, e.g., "Pass", "Fail"
  sampleSize: int("sample_size").default(1).notNull(), // Number of physical samples tested, e.g., 3
  notes: varchar("notes", { length: 500 }), // Remarks
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});