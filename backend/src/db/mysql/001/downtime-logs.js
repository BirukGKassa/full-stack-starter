import { mysqlTable, varchar, int, timestamp, boolean } from "drizzle-orm/mysql2";

/**
 * MODEL: downtime_reasons
 * PURPOSE: Master lookup table categorizing machine stoppages (mechanical, setup, cleaning).
 * EXAMPLE: Reason code "DIE_CHANGE" under category "Setup_Changeover" requiring a technician.
 */
export const downtimeReasons = mysqlTable("downtime_reasons", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  category: varchar("category", { length: 100 }).notNull(), // Downtime category, e.g., "Setup_Changeover"
  reasonCode: varchar("reason_code", { length: 50 }).notNull().unique(), // Unique reason code, e.g., "DIE_CHANGE"
  description: varchar("description", { length: 255 }).notNull(), // Description, e.g., "Extrusion die profile swap"
  requiresTechnician: boolean("requires_technician").default(false).notNull(), // Requires tech flag, e.g., true
  isActive: boolean("is_active").default(true).notNull(), // Active status flag, e.g., true
});

/**
 * MODEL: machine_downtime_logs
 * PURPOSE: Logs specific stoppage instances against work centers to calculate OEE Availability.
 * EXAMPLE: "PRESS-01" stopped for 45 minutes due to "DIE_CHANGE", resolved by technician "TECH-440".
 */
export const machineDowntimeLogs = mysqlTable("machine_downtime_logs", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Unique identifier
  companyId: varchar("company_id", { length: 50 }).notNull(), // Multi-tenant company identifier
  workCenterCode: varchar("work_center_code", { length: 50 }).notNull(), // Machine code, e.g., "PRESS-01"
  downtimeReasonId: varchar("downtime_reason_id", { length: 36 }).notNull(), // Reason reference ID
  startTime: datetime("start_time").notNull(), // Stoppage start datetime (safe for ongoing active checks)
  endTime: datetime("end_time"), // Stoppage resolution timestamp
  durationMinutes: int("duration_minutes"), // Total downtime duration in minutes, e.g., 45
  technicianId: varchar("technician_id", { length: 50 }), // Assigned technician ID, e.g., "TECH-440"
  isVerified: boolean("is_verified").default(false).notNull(), // Supervisor sign-off flag, e.g., true
  notes: varchar("notes", { length: 500 }), // Stoppage notes
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});