import { mysqlTable, varchar, float, timestamp, datetime } from "drizzle-orm/mysql2";

/**
 * MODEL: manufacturing_orders
 * PURPOSE: Tracks active work orders scheduled for production, monitoring target vs produced quantities.
 * EXAMPLE: Order "MO-2026-00192" targeting 1000 meters of "AL-PROF-6M", currently "In Progress".
 */
export const manufacturingOrders = mysqlTable("manufacturing_orders", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  companyId: varchar("company_id", { length: 50 }).notNull(), // Multi-tenant company identifier (e.g., COMP-AMH-01)
  orderNumber: varchar("order_number", { length: 100 }).notNull(), // Friendly tracking number, e.g., "MO-2026-00192"
  bomId: varchar("bom_id", { length: 36 }).notNull(), // Reference ID to BOM master recipe
  productSku: varchar("product_sku", { length: 100 }).notNull(), // Finished product SKU, e.g., "AL-PROF-6M"
  targetQuantity: float("target_quantity").notNull(), // Planned production goal, e.g., 1000.0
  producedQty: float("produced_qty").default(0.0).notNull(), // Running total of good units, e.g., 500.0
  scrapQty: float("scrap_qty").default(0.0).notNull(), // Running total of defective units, e.g., 10.0
  status: varchar("status", { length: 50 }).default("Draft").notNull(), // Lifecycle state, e.g., "In Progress"
  priority: varchar("priority", { length: 50 }).default("Normal").notNull(), // Urgency level, e.g., "High"
  batchNumber: varchar("batch_number", { length: 100 }), // Quality batch trace code, e.g., "LOT-ALUM-881"
  warehouseCode: varchar("warehouse_code", { length: 50 }).default("WH-MAIN").notNull(), // Destination warehouse
  dueDate: datetime("due_date"), // Target completion deadline datetime
  startedAt: datetime("started_at"), // Actual production start datetime (supports NULL for unstarted orders)
  completedAt: datetime("completed_at"), // Actual completion datetime (supports NULL for active orders)
  notes: varchar("notes", { length: 500 }), // Shop floor instructions
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(), // Record update timestamp
});