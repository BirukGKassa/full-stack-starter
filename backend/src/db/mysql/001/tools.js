import { mysqlTable, varchar, int, timestamp } from "drizzle-orm/mysql-core";

/**
 * MODEL: factory_tools
 * PURPOSE: Tracks high-wear tooling, dies, and molds to prevent catastrophic failure based on lifecycle cycles.
 * EXAMPLE: Die "DIE-EXT-04" (6m Window Frame Die) with 14,200 current cycles out of 50,000 max cycles.
 */
export const factoryTools = mysqlTable("factory_tools", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  code: varchar("code", { length: 50 }).notNull().unique(), // Tool code identifier, e.g., "DIE-EXT-04"
  name: varchar("name", { length: 255 }).notNull(), // Tool display name, e.g., "6m Window Frame Die"
  toolType: varchar("tool_type", { length: 50 }).notNull(), // Classification, e.g., "die", "mold", "roller"
  maxCycles: int("max_cycles").notNull(), // Maximum lifespan limit, e.g., 50000
  currentCycles: int("current_cycles").default(0).notNull(), // Cumulative cycles logged, e.g., 14200
  status: varchar("status", { length: 50 }).default("Active").notNull(), // Operational status, e.g., "Active"
  assignedWorkCenterCode: varchar("assigned_work_center_code", { length: 50 }), // Assigned machine code
  lastMaintenanceDate: timestamp("last_maintenance_date"), // Last servicing timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(), // Record update timestamp
});