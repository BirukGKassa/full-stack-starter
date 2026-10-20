import { mysqlTable, varchar, float, timestamp } from "drizzle-orm/mysql-core";

/**
 * MODEL: material_lot_traces
 * PURPOSE: Ensures food safety and regulatory backward/forward traceability by recording raw material batch lots consumed.
 * EXAMPLE: Consumed 112.5 kg of Aluminum Billet (RAW-BILLET-6063) from supplier lot "SUPPLIER-LOT-99321".
 */
export const materialLotTraces = mysqlTable("material_lot_traces", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  manufacturingOrderId: varchar("manufacturing_order_id", { length: 36 }).notNull(), // Work order reference ID
  componentSku: varchar("component_sku", { length: 100 }).notNull(), // Raw material SKU, e.g., "RAW-BILLET-6063"
  lotNumber: varchar("lot_number", { length: 100 }).notNull(), // Supplier batch number, e.g., "SUPPLIER-LOT-99321"
  quantityUsed: float("quantity_used").notNull(), // Amount consumed, e.g., 112.5
  unitOfMeasure: varchar("unit_of_measure", { length: 50 }).notNull(), // Unit, e.g., "kg"
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});