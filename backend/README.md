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
