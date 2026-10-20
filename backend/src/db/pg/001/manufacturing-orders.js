import { pgTable, uuid, text, real, timestamp } from "drizzle-orm/pg-core";
import { boms } from "./boms.js";

/**
 * MODEL: manufacturing_orders
 * PURPOSE: Tracks active work orders scheduled for production, monitoring target vs produced quantities.
 * EXAMPLE: Order "MO-2026-00192" targeting 1000 meters of "AL-PROF-6M", currently "In Progress".
 */
export const manufacturingOrders = pgTable("manufacturing_orders", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  orderNumber: text("order_number").notNull().unique(), // Friendly tracking number, e.g., "MO-2026-00192"
  bomId: uuid("bom_id").notNull().references(() => boms.id), // Reference ID to BOM master recipe
  productSku: text("product_sku").notNull(), // Finished product SKU, e.g., "AL-PROF-6M"
  targetQuantity: real("target_quantity").notNull(), // Planned production goal, e.g., 1000.0
  producedQty: real("produced_qty").default(0.0).notNull(), // Running total of good units, e.g., 500.0
  scrapQty: real("scrap_qty").default(0.0).notNull(), // Running total of defective units, e.g., 10.0
  status: text("status").default("Draft").notNull(), // Lifecycle state, e.g., "In Progress", "Completed"
  priority: text("priority").default("Normal").notNull(), // Urgency level, e.g., "High", "Urgent"
  batchNumber: text("batch_number"), // Quality batch trace code, e.g., "LOT-ALUM-881"
  warehouseCode: text("warehouse_code").default("WH-MAIN").notNull(), // Destination warehouse, e.g., "WH-FINISHED-GOODS"
  dueDate: timestamp("due_date"), // Target completion deadline timestamp
  startedAt: timestamp("started_at"), // Actual production start timestamp
  completedAt: timestamp("completed_at"), // Actual completion timestamp
  notes: text("notes"), // Shop floor instructions, e.g., "Urgent client order for commercial project"
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Record update timestamp
});