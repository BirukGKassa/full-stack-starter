import './src/config.js';
import { defineConfig } from 'drizzle-kit';

const dbType = process.env.DB_TYPE || 'mysql';

export default defineConfig({
  out: './drizzle',
  schema: dbType === 'mysql' ? './src/db/mysql/index.js' : './src/db/pg/index.js',
  dialect: dbType === 'mysql' ? 'mysql' : 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});