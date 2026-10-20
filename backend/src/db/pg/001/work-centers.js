import { pgTable, uuid, text, real, timestamp, json } from "drizzle-orm/pg-core";

/**
 * MODEL: work_centers
 * PURPOSE: Represents physical workstations, presses, looms, or mills on the factory floor.
 * EXAMPLE: Machine "PRESS-01" (500T Extrusion Press Line 1) with an operating overhead cost of $120.00/hr.
 */
export const workCenters = pgTable("work_centers", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  plantId: text("plant_id").default("PLANT-01").notNull(), // Facility plant ID, e.g., "PLANT-NORTH"
  code: text("code").notNull().unique(), // Unique machine code, e.g., "PRESS-01"
  name: text("name").notNull(), // Display name, e.g., "500T Extrusion Press Line 1"
  factoryType: text("factory_type").notNull(), // Industry type, e.g., "aluminum", "pp_bag", "flour", "korki"
  status: text("status").default("Active").notNull(), // Operational state, e.g., "Active", "Maintenance"
  costPerHour: real("cost_per_hour").default(0.0).notNull(), // Machine overhead cost per hour, e.g., 120.00
  nominalSpeed: real("nominal_speed").default(0.0).notNull(), // Baseline design speed, e.g., 50.0
  speedUnit: text("speed_unit"), // Speed measurement unit, e.g., "meters_per_minute"
  metadata: json("metadata"), // Machine specs, e.g., {"max_tonnage": 500, "manufacturer": "SMS Meer"}
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Record update timestamp
});