import { boolean, index, mysqlTable, text, timestamp, datetime, varchar } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 255 }).primaryKey(),
  expiresAt: datetime('expiresAt', { mode: 'date', fsp: 3 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('createdAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
  ipAddress: varchar('ipAddress', { length: 255 }),
  userAgent: text('userAgent'),
  userId: varchar('userId', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_userId_idx').on(table.userId)]);

export const account = mysqlTable('account', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('accountId', { length: 255 }).notNull(),
  providerId: varchar('providerId', { length: 255 }).notNull(),
  userId: varchar('userId', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: datetime('accessTokenExpiresAt', { mode: 'date', fsp: 3 }),
  refreshTokenExpiresAt: datetime('refreshTokenExpiresAt', { mode: 'date', fsp: 3 }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
}, (table) => [index('account_userId_idx').on(table.userId)]);

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: text('value').notNull(),
  expiresAt: datetime('expiresAt', { mode: 'date', fsp: 3 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', fsp: 3 }).defaultNow().notNull(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);