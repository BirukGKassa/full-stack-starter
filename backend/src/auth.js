import './config.js';
import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db, dbType } from './db/index.js';

const port = process.env.PORT || 3005;
const github = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  ? {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    }
  : {};

export const auth = betterAuth({
  appName: process.env.APP_NAME || 'Express Drizzle Starter',
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${port}`,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  database: drizzleAdapter(db, { provider: dbType === 'pg' ? 'pg' : 'mysql' }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: github,
  plugins: [username()],
});