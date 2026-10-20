import { pgTable, varchar, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const moduleAssignments = pgTable('module_assignments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  moduleKey: varchar('module_key', { length: 50 }).notNull(),
  assignedBy: varchar('assigned_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('module_assignments_user_module_idx').on(table.userId, table.moduleKey),
  index('module_assignments_user_idx').on(table.userId),
]);

export const productionAuditLogs = pgTable('production_audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  moduleKey: varchar('module_key', { length: 50 }).notNull(),
  action: varchar('action', { length: 20 }).notNull(),
  recordId: varchar('record_id', { length: 255 }),
  workstationName: varchar('workstation_name', { length: 255 }),
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('production_audit_user_idx').on(table.userId),
  index('production_audit_record_idx').on(table.recordId),
  index('production_audit_created_idx').on(table.createdAt),
]);
