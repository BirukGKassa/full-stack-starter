import { index, integer, jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { user } from '../auth.js';

export const companyProfiles = pgTable('company_profiles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  taxNumber: varchar('tax_number', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 255 }),
  addressLine1: varchar('address_line_1', { length: 255 }),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  region: varchar('region', { length: 100 }),
  postalCode: varchar('postal_code', { length: 30 }),
  country: varchar('country', { length: 100 }),
  updatedBy: varchar('updated_by', { length: 255 }).references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const systemLicenses = pgTable('system_licenses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),
  keyLastFour: varchar('key_last_four', { length: 4 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  createdBy: varchar('created_by', { length: 255 }).notNull().references(() => user.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('system_licenses_status_expiry_idx').on(table.status, table.expiresAt),
]);

export const systemEvents = pgTable('system_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  level: varchar('level', { length: 20 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  message: varchar('message', { length: 1000 }).notNull(),
  path: varchar('path', { length: 500 }),
  statusCode: integer('status_code'),
  userId: varchar('user_id', { length: 255 }),
  details: jsonb('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('system_events_level_created_idx').on(table.level, table.createdAt),
  index('system_events_category_created_idx').on(table.category, table.createdAt),
]);
