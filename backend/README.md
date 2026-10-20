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

### Production administrator setup

Set `LYU_ADMIN_EMAILS` in the root `.env` to a comma-separated list of trusted administrator email addresses, for example `LYU_ADMIN_EMAILS=admin@example.com`. Restart the backend after changing it. Register or sign in with one of those addresses, then open **Production → System settings** to create users and assign module access. New accounts are created with a temporary password entered by the administrator; share it securely.

Run `npm run db:push` in `backend` after deploying these settings to create the module-assignment and audit tables. Users without module assignments cannot read production APIs. Record attribution includes the authenticated user and a workstation label saved in that user's browser; browsers do not expose a PC's hostname to the application.
