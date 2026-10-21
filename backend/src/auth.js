import './config.js';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { username } from 'better-auth/plugins';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { db, dbType, schema } from './db/index.js';

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
  databaseHooks: {
    session: {
      create: {
        before: async (newSession) => {
          const [accountUser] = await db.select({ isActive: schema.user.isActive })
            .from(schema.user)
            .where(eq(schema.user.id, newSession.userId));
          if (!accountUser?.isActive) {
            throw new APIError('FORBIDDEN', { message: 'This account is inactive. Contact an administrator.' });
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: github,
  plugins: [username()],
});