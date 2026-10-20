import '../config.js';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Pool } = pkg;

import * as mysqlSchema from './mysql/index.js';
import * as pgSchema from './pg/index.js';

const dbType = process.env.DB_TYPE || 'mysql';

let db;
let schema;
let pool;

if (dbType === 'mysql') {
  pool = mysql.createPool({ uri: process.env.DATABASE_URL });
  schema = mysqlSchema;
  
  // Added mode: 'default' here
  db = drizzleMysql({ client: pool, schema, mode: 'default' });
  
} else if (dbType === 'pg') {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  schema = pgSchema;
  db = drizzlePg({ client: pool, schema });
} else {
  throw new Error(`Unsupported DB_TYPE: ${dbType}`);
}

export { db, pool, schema, dbType };