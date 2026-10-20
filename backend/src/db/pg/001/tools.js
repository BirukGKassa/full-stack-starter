import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { workCenters } from "./work-centers.js";

/**
 * MODEL: factory_tools
 * PURPOSE: Tracks high-wear tooling, dies, and molds to prevent catastrophic failure based on lifecycle cycles.
 * EXAMPLE: Die "DIE-EXT-04" (6m Window Frame Die) with 14,200 current cycles out of 50,000 max cycles.
 */
export const factoryTools = pgTable("factory_tools", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  code: text("code").notNull().unique(), // Tool code identifier, e.g., "DIE-EXT-04"
  name: text("name").notNull(), // Tool display name, e.g., "6m Window Frame Die"
  toolType: text("tool_type").notNull(), // Classification, e.g., "die", "mold", "roller", "blade"
  maxCycles: integer("max_cycles").notNull(), // Maximum lifespan limit, e.g., 50000
  currentCycles: integer("current_cycles").default(0).notNull(), // Cumulative cycles logged, e.g., 14200
  status: text("status").default("Active").notNull(), // Operational status, e.g., "Active", "Maintenance"
  assignedWorkCenterCode: text("assigned_work_center_code").references(() => workCenters.code), // Assigned machine code, e.g., "PRESS-01"
  lastMaintenanceDate: timestamp("last_maintenance_date"), // Last servicing timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Record update timestamp
});