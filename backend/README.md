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

Set `LYU_ADMIN_EMAILS` in the root `.env` to configure administrator bootstrap emails. `LYU_OWNER_EMAIL` may select the main owner explicitly; otherwise, the first email in `LYU_ADMIN_EMAILS` is the owner. Only the owner can grant or revoke administrator roles. Administrators can create regular users and assign ERP modules from **Dashboard → User access**; public sign-up is disabled.

For a first deployment, set `REGISTER_ADMIN_LINK` to a private random token or a URL such as `https://erp.example.com/go?setup=<long-random-token>`. A raw token is exposed as a `/go?setup=...` link by the sign-in page. Use the link once to create the configured owner account; the setup endpoint is disabled after that account exists. Keep the token private and unset the variable after setup. The owner cannot be demoted or deactivated, and the dashboard stays unavailable until the active owner account is set up.

Set the server-only `LICENCE_KEY` and register the matching key in **Dashboard → System console**. Keys that do not match remain pending and can be retried with **Refresh status**; unactivated pending keys are automatically deleted after 30 minutes. Set `LICENSE_DURATION_DAYS` in the root `.env` to control the initial license term and each renewal; it defaults to 365 days. Renewal is enabled during the final 10 days and adds the configured duration to the previous active license expiration, carrying over any remaining days (for example, five days remaining results in `LICENSE_DURATION_DAYS + 5` days from renewal). The previous license is marked used when renewal activates. An expired or unlicensed deployment remains accessible only for administrator license recovery.

Run `npm run db:push` in `backend` after deploying these settings to create the module-assignment, company, license, and system-event tables and update user fields. The admin console shows database connectivity, system errors, user activity and sessions, machine downtime, and the primary company profile. Users can change their password and revoke their own sessions under **Dashboard → Password & sessions**.
