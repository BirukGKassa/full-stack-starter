import { mysqlTable, varchar, float, int, boolean, timestamp, json, unique } from "drizzle-orm/mysql2";

/**
 * MODEL: boms
 * PURPOSE: Master recipe and engineering structure for manufactured goods. 
 * Defines standard outputs, expected runtime, and version control.
 * EXAMPLE: Product "AL-PROF-6M" producing 6.0 meters of aluminum profile in 30 minutes.
 */
export const boms = mysqlTable("boms", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique UUID string identifier
  productSku: varchar("product_sku", { length: 100 }).notNull().unique(), // Finished good stock code, e.g., "AL-PROF-6M"
  productName: varchar("product_name", { length: 255 }).notNull(), // Human-readable product name, e.g., "Architectural Profile 6m"
  version: int("version").default(1).notNull(), // Revision tracking integer, e.g., 1
  isActive: boolean("is_active").default(true).notNull(), // Active status toggle, e.g., true
  outputQty: float("output_quantity").default(1.0).notNull(), // Batch output quantity, e.g., 6.0
  outputUnit: varchar("output_unit", { length: 50 }).notNull(), // Measurement unit, e.g., "meters", "pieces"
  standardRunMinutes: float("standard_run_minutes").default(0.0).notNull(), // Expected production time, e.g., 30.0
  notes: varchar("notes", { length: 500 }), // Engineering notes
  metadata: json("metadata"), // Industry attributes, e.g., {"extrusion_temp_celsius": 480}
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(), // Record update timestamp
});

/**
 * MODEL: bom_lines
 * PURPOSE: Lists exact raw materials or components required to build a BOM product, including cost and scrap allowances.
 * EXAMPLE: Requires 4.5 kg of Aluminum Billet (RAW-BILLET-6063) with a unit cost of 2.50.
 */
export const bomLines = mysqlTable("bom_lines", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique UUID string identifier
  bomId: varchar("bom_id", { length: 36 }).notNull(), // Parent BOM reference ID
  componentSku: varchar("component_sku", { length: 100 }).notNull(), // Raw material SKU, e.g., "RAW-BILLET-6063"
  componentName: varchar("component_name", { length: 255 }).notNull(), // Raw material name
  quantityReq: float("quantity_required").notNull(), // Required quantity per batch, e.g., 4.5
  unitOfMeasure: varchar("unit_of_measure", { length: 50 }).notNull(), // Measurement unit, e.g., "kg"
  unitCost: float("unit_cost").default(0.0).notNull(), // Cost per unit for COGM, e.g., 2.50
  scrapFactor: float("scrap_factor").default(0.0).notNull(), // Expected waste percentage, e.g., 0.02
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});