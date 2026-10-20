import { mysqlTable, varchar, float, timestamp, json } from "drizzle-orm/mysql2";

/**
 * MODEL: work_centers
 * PURPOSE: Represents physical workstations, presses, looms, or mills on the factory floor.
 * EXAMPLE: Machine "PRESS-01" (500T Extrusion Press Line 1) with an operating overhead cost of $120.00/hr.
 */
export const workCenters = mysqlTable("work_centers", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  plantId: varchar("plant_id", { length: 50 }).default("PLANT-01").notNull(), // Facility plant ID, e.g., "PLANT-NORTH"
  code: varchar("code", { length: 50 }).notNull().unique(), // Unique machine code, e.g., "PRESS-01"
  name: varchar("name", { length: 255 }).notNull(), // Display name, e.g., "500T Extrusion Press Line 1"
  factoryType: varchar("factory_type", { length: 50 }).notNull(), // Industry type, e.g., "aluminum", "pp_bag", "flour"
  status: varchar("status", { length: 50 }).default("Active").notNull(), // Operational state, e.g., "Active"
  costPerHour: float("cost_per_hour").default(0.0).notNull(), // Machine overhead cost per hour, e.g., 120.00
  nominalSpeed: float("nominal_speed").default(0.0).notNull(), // Baseline design speed, e.g., 50.0
  speedUnit: varchar("speed_unit", { length: 50 }), // Speed measurement unit, e.g., "meters_per_minute"
  metadata: json("metadata"), // Machine specs, e.g., {"max_tonnage": 500}
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(), // Record update timestamp
});