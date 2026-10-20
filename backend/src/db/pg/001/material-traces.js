import { pgTable, uuid, text, real, timestamp } from "drizzle-orm/pg-core";
import { manufacturingOrders } from "./manufacturing-orders.js";

/**
 * MODEL: material_lot_traces
 * PURPOSE: Ensures food safety and regulatory backward/forward traceability by recording raw material batch lots consumed.
 * EXAMPLE: Consumed 112.5 kg of Aluminum Billet (RAW-BILLET-6063) from supplier lot "SUPPLIER-LOT-99321".
 */
export const materialLotTraces = pgTable("material_lot_traces", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  manufacturingOrderId: uuid("manufacturing_order_id").notNull().references(() => manufacturingOrders.id), // Work order reference ID
  componentSku: text("component_sku").notNull(), // Raw material SKU, e.g., "RAW-BILLET-6063"
  lotNumber: text("lot_number").notNull(), // Supplier or warehouse batch number, e.g., "SUPPLIER-LOT-99321"
  quantityUsed: real("quantity_used").notNull(), // Amount consumed, e.g., 112.5
  unitOfMeasure: text("unit_of_measure").notNull(), // Unit, e.g., "kg", "liters"
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});