import { pgTable, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 30 }).unique(),
  displayUsername: varchar('displayUsername', { length: 30 }),
  employeeId: varchar('employeeId', { length: 50 }).unique(),
  isActive: boolean('isActive').default(true).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: varchar('id', { length: 255 }).primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: varchar('ipAddress', { length: 255 }),
  userAgent: text('userAgent'),
  userId: varchar('userId', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_userId_idx').on(table.userId)]);

export const account = pgTable('account', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('accountId', { length: 255 }).notNull(),
  providerId: varchar('providerId', { length: 255 }).notNull(),
  userId: varchar('userId', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('account_userId_idx').on(table.userId)]);

export const verification = pgTable('verification', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);