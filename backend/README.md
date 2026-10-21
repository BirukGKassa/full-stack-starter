# Express + Better Auth backend

This JavaScript backend is part of the full-stack starter documented in the repository-root [README](../README.md). Its shared environment is `../.env`; there are intentionally no backend-local `.env` or `.env.example` files.

## Run locally

From this directory, install dependencies, set the root `.env` `DB_TYPE` and `DATABASE_URL`, initialize the schema, and start Express:

```sh
npm install
npm run db:push
npm run dev
```

Set `DB_TYPE=mysql` for MySQL or `DB_TYPE=pg` for PostgreSQL. `npm run start:docker` applies the selected Drizzle schema and starts the server; Compose invokes it after both database services are healthy.

Better Auth is mounted at `/api/auth/*`; the session and database health endpoints are `/api/session` and `/api/health`. Configure all database and auth secrets in the single root `.env` file. See the root README for Docker, provider selection, frontend, and deployment setup.

## Production operations

After signing in, open `/production` in the frontend to record shifts, machine downtime, work orders, product recipes, inspections, material lots, and tool maintenance. The workspace supports factory-specific filtering, weekly/monthly production summaries, CSV export, and operator analytics. Its endpoints are mounted under `/api/v1/production`; apply the selected Drizzle schema before using the workspace. MySQL demo data for AMH, AMR, KORKI, and RASA is documented in [`seeds/mysql/README.md`](./seeds/mysql/README.md).

### Administrator and user access

Set `LYU_ADMIN_EMAILS` in the root `.env` to a comma-separated list of trusted administrator email addresses. Only those addresses receive administrator access. Public sign-up is disabled; administrators create accounts and assign ERP module access from **Dashboard → User access**. Users sign in with their email, username, or employee ID.

For a first deployment, set `REGISTER_ADMIN_LINK` to a private random token or a URL such as `https://erp.example.com/go?setup=<long-random-token>`. A raw token is exposed as a `/go?setup=...` link by the sign-in page. Use the link once to create an administrator whose email is in `LYU_ADMIN_EMAILS`; the setup endpoint is disabled after the first allowlisted administrator exists. Keep the token private and unset the variable after setup.

Set the server-only `LICENCE_KEY` and register the matching key in **Dashboard → System console**. Keys that do not match remain pending and can be retried with **Refresh status**. Set `LICENSE_DURATION_DAYS` in the root `.env` to control the initial license term and each renewal; it defaults to 365 days. Renewal is enabled during the final 10 days. An expired or unlicensed deployment remains accessible only for administrator license recovery.

Run `npm run db:push` in `backend` after deploying these settings to create the module-assignment, company, license, and system-event tables and update user fields. The admin console shows database connectivity, system errors, user activity and sessions, machine downtime, and the primary company profile. Users can change their password and revoke their own sessions under **Dashboard → Password & sessions**.
