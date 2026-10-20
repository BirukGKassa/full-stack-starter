import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { workCenters } from "./work-centers.js";

/**
 * MODEL: downtime_reasons
 * PURPOSE: Master lookup table categorizing machine stoppages (mechanical, setup, cleaning).
 * EXAMPLE: Reason code "DIE_CHANGE" under category "Setup_Changeover" requiring a technician.
 */
export const downtimeReasons = pgTable("downtime_reasons", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  category: text("category").notNull(), // Downtime category, e.g., "Setup_Changeover", "Mechanical"
  reasonCode: text("reason_code").notNull().unique(), // Unique reason code, e.g., "DIE_CHANGE"
  description: text("description").notNull(), // Description, e.g., "Extrusion die profile swap"
  requiresTechnician: boolean("requires_technician").default(false).notNull(), // Requires tech flag, e.g., true
  isActive: boolean("is_active").default(true).notNull(), // Active status flag, e.g., true
});

/**
 * MODEL: machine_downtime_logs
 * PURPOSE: Logs specific stoppage instances against work centers to calculate OEE Availability.
 * EXAMPLE: "PRESS-01" stopped for 45 minutes due to "DIE_CHANGE", resolved by technician "TECH-440".
 */
export const machineDowntimeLogs = pgTable("machine_downtime_logs", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique identifier
  workCenterCode: text("work_center_code").notNull().references(() => workCenters.code), // Machine code, e.g., "PRESS-01"
  downtimeReasonId: uuid("downtime_reason_id").notNull().references(() => downtimeReasons.id), // Reason reference ID
  startTime: timestamp("start_time").notNull(), // Stoppage start timestamp
  endTime: timestamp("end_time"), // Stoppage resolution timestamp (nullable if ongoing)
  durationMinutes: integer("duration_minutes"), // Total downtime duration in minutes, e.g., 45
  technicianId: text("technician_id"), // Assigned technician ID, e.g., "TECH-440"
  isVerified: boolean("is_verified").default(false).notNull(), // Supervisor sign-off flag, e.g., true
  notes: text("notes"), // Stoppage notes, e.g., "Swapped profile shape #882 successfully"
  createdAt: timestamp("created_at").defaultNow().notNull(), // Record creation timestamp
});