import { pgTable, uuid, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { manufacturingOrders } from "./manufacturing-orders.js";

/**
 * MODEL: quality_inspections
 * PURPOSE: Logs physical quality measurements and test results against regulatory and product specifications.
 * EXAMPLE: Inspection "thickness" measured at 1.83mm (target 1.80mm, range 1.75-1.85mm), status "Pass".
 */
export const qualityInspections = pgTable("quality_inspections", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  manufacturingOrderId: uuid("manufacturing_order_id").notNull().references(() => manufacturingOrders.id), // Work order reference ID
  inspectorId: text("inspector_id").notNull(), // QA staff ID, e.g., "INS-01"
  inspectionType: text("inspection_type").notNull(), // Test type, e.g., "thickness", "burst_test", "moisture", "torque"
  measuredValue: real("measured_value").notNull(), // Actual physical reading, e.g., 1.83
  targetValue: real("target_value").notNull(), // Ideal baseline spec, e.g., 1.80
  lowerLimit: real("lower_limit"), // Minimum tolerance boundary, e.g., 1.75
  upperLimit: real("upper_limit"), // Maximum tolerance boundary, e.g., 1.85
  status: text("status").notNull(), // Evaluation result, e.g., "Pass", "Fail", "Warning"
  sampleSize: integer("sample_size").default(1).notNull(), // Number of physical samples tested, e.g., 3
  notes: text("notes"), // Remarks, e.g., "Measured with digital micrometer at output conveyor"
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});