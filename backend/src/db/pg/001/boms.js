import { pgTable, uuid, text, real, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

/**
 * MODEL: boms
 * PURPOSE: Master recipe and engineering structure for manufactured goods. 
 * Defines standard outputs, expected runtime, and version control.
 * EXAMPLE: Product "AL-PROF-6M" producing 6.0 meters of aluminum profile in 30 minutes.
 */
export const boms = pgTable("boms", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier, e.g., "550e8400-e29b-41d4-a716-446655440000"
  productSku: text("product_sku").notNull().unique(), // Finished good stock code, e.g., "AL-PROF-6M"
  productName: text("product_name").notNull(), // Human-readable product name, e.g., "Architectural Profile 6m"
  version: integer("version").default(1).notNull(), // Revision tracking integer, e.g., 1
  isActive: boolean("is_active").default(true).notNull(), // Active status toggle, e.g., true
  outputQty: real("output_quantity").default(1.0).notNull(), // Batch output quantity, e.g., 6.0
  outputUnit: text("output_unit").notNull(), // Measurement unit, e.g., "meters", "pieces", "bags"
  standardRunMinutes: real("standard_run_minutes").default(0.0).notNull(), // Expected production time, e.g., 30.0
  notes: text("notes"), // Engineering notes, e.g., "Standard extrusion profile for window frames"
  metadata: json("metadata"), // Industry attributes, e.g., {"extrusion_temp_celsius": 480, "alloy_grade": "6063-T5"}
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Record update timestamp
});

/**
 * MODEL: bom_lines
 * PURPOSE: Lists exact raw materials or components required to build a BOM product, including cost and scrap allowances.
 * EXAMPLE: Requires 4.5 kg of Aluminum Billet (RAW-BILLET-6063) with a unit cost of 2.50.
 */
export const bomLines = pgTable("bom_lines", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  bomId: uuid("bom_id").notNull().references(() => boms.id, { onDelete: "cascade" }), // Parent BOM reference ID
  componentSku: text("component_sku").notNull(), // Raw material SKU, e.g., "RAW-BILLET-6063"
  componentName: text("component_name").notNull(), // Raw material name, e.g., "Aluminum Billet 6063"
  quantityReq: real("quantity_required").notNull(), // Required quantity per batch, e.g., 4.5
  unitOfMeasure: text("unit_of_measure").notNull(), // Measurement unit, e.g., "kg", "meters"
  unitCost: real("unit_cost").default(0.0).notNull(), // Cost per unit for COGM, e.g., 2.50
  scrapFactor: real("scrap_factor").default(0.0).notNull(), // Expected waste percentage, e.g., 0.02 (2%)
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});