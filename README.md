# Better Auth + Express Full-Stack Starter

A JavaScript full-stack starter with Better Auth, Express 5, Drizzle ORM, MySQL **or** PostgreSQL, React, Tailwind CSS, and Docker Compose. The browser frontend is built with React Router, Tailwind CLI, and esbuild—no Vite or TypeScript. Its page-oriented source layout is inspired by Next.js, but it runs as a static single-page app behind Nginx.

## Quick start with Docker

1. Copy the root `.env.example` to `.env`.
2. Keep the MySQL settings, or follow [Choose MySQL or PostgreSQL](#choose-mysql-or-postgresql).
3. Change the database passwords and set `BETTER_AUTH_SECRET` to a unique random value with at least 32 characters.
4. From this directory, run `npm run dev` (equivalent to `docker compose up --build`).
5. Open `http://localhost:8080`.

Compose starts both database containers and waits for them to become healthy. The backend selects the database in `DB_TYPE`, pushes the matching Drizzle schema (including Better Auth's user/session/account/verification tables), and starts Express. Nginx serves the React app and proxies `/api/*` to Express; the frontend and API share one origin for secure auth cookies.

The frontend is available at `http://localhost:8080`; the Express API is also directly available at `http://localhost:3005` for API tools and local integrations. Configure the published ports with `FRONTEND_PORT` and `BACKEND_PORT` in `.env`. For browser-based authentication, use the frontend's proxied `/api/*` routes so cookies remain same-origin.

Stop the stack with Ctrl+C, then run `npm run dev:down` (equivalent to `docker compose down`). MySQL and PostgreSQL data are retained in named volumes. To delete both databases and all their data, use `docker compose down -v` (destructive).

## Choose MySQL or PostgreSQL

The starter includes both services in Compose. Choose one in the root `.env`; set **both** URLs to the same provider, using the host port for local Node and the service name for Docker:

**MySQL (default):**

```env
DB_TYPE=mysql
DATABASE_URL=mysql://northstar:northstar-dev-password@127.0.0.1:3307/northstar
DATABASE_URL_DOCKER=mysql://northstar:northstar-dev-password@mysql:3306/northstar
```

**PostgreSQL:**

```env
DB_TYPE=pg
DATABASE_URL=mysql://northstar:northstar-dev-password@127.0.0.1:3307/northstar
DATABASE_URL_DOCKER=mysql://northstar:northstar-dev-password@mysql:3306/northstar
```

Apply the setting before starting the backend or Compose. Database credentials and host ports are configurable from the same root `.env`. The default ports exposed to the host are MySQL `3307` and PostgreSQL `5433`; container-only service ports remain `3306` and `5432`.

### Change the database name, user, or password

Edit the root `.env` before starting the stack. For MySQL, update these variables together:

```env
MYSQL_DATABASE=my_app_db
MYSQL_USER=my_app_user
MYSQL_PASSWORD=choose-a-strong-password
MYSQL_ROOT_PASSWORD=choose-a-different-strong-password
DATABASE_URL=mysql://my_app_user:choose-a-strong-password@127.0.0.1:3307/my_app_db
DATABASE_URL_DOCKER=mysql://my_app_user:choose-a-strong-password@mysql:3306/my_app_db
```

`MYSQL_ROOT_PASSWORD` is only for the MySQL container's root account; the backend connects as `MYSQL_USER` using `MYSQL_PASSWORD`. The database name, username, and password in both connection URLs must match the corresponding MySQL settings. For PostgreSQL, use `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`, then update both connection URLs with those values and the `postgres` host in `DATABASE_URL_DOCKER`.

After editing `.env`, recreate the containers with `docker compose up -d`. The database image applies its `*_DATABASE`, `*_USER`, and `*_PASSWORD` initialization settings only when its data volume is first created. If that volume already contains a database, changing `.env` alone does not rename the database or change its existing account/password; apply those changes in the running database and keep both connection URLs in sync. Do not use `docker compose down -v` to apply credential changes unless you intend to permanently delete all stored database data.

## Run services without Docker

Requirements: Node.js 20 or newer, npm, and a running MySQL or PostgreSQL database.

1. Copy `.env.example` to the root `.env`, choose `DB_TYPE`, and set `DATABASE_URL` to your local database.
2. Install backend dependencies and initialize the selected schema:

   ```sh
   cd back-starter
   npm install
   npm run db:push
   npm run dev
   ```

3. In a second terminal, start the frontend dev server:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:8080`. The dev server rebuilds CSS and JavaScript when you edit frontend files, serves the app with route fallback, and proxies `/api/*` to the backend at `http://localhost:3005`. Keep the backend running in the first terminal. The root `.env` `BETTER_AUTH_URL` and `FRONTEND_URL` should both use `http://localhost:8080` for this setup.

Drizzle commands (`npm run db:generate`, `npm run db:push`, `npm run db:studio`) load configuration from the single root `.env`. Review generated schema changes before applying them to any production database.

## Frontend pages

```text
frontend/
  index.html
  src/
    app.js                  React Router routes
    app/
      layout.js             Shared layout
      page.js               Home page (/)
      go/page.js            Sign in and private initial-admin setup (/go)
      dashboard/page.js     Session-protected dashboard (/dashboard)
      dashboard/security/   Password and session management
      dashboard/system/     Company, license, health, logs, and downtime administration
    lib/auth-client.js      Better Auth React client
    styles/globals.css      Tailwind directives and UI styles
```

All application source is JavaScript. Tailwind CSS compiles the styles, esbuild bundles React, and Nginx serves the single-page app with route fallback.

## Backend and authentication

- Better Auth endpoints: `/api/auth/*`
- Public registration is disabled. A private initial-admin link may be configured with `REGISTER_ADMIN_LINK`; administrator emails are restricted to `LYU_ADMIN_EMAILS`.
- Users sign in with their email, username, or employee ID. Password changes and session revocation are available in the account security page.
- Set the server-only `LICENCE_KEY` to enable license activation and annual renewal in the admin system console. Unlicensed or expired systems allow administrator license recovery only.
- Optional GitHub OAuth: set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the root `.env`.
- `GET /api/session`: current session, or HTTP `401` when signed out.
- `GET /api/health`: database connectivity check.
- The example includes news API routes under `/api/news`.
- Set `BETTER_AUTH_URL` to the browser-visible app origin and `FRONTEND_URL` to the frontend origin. In the default Docker setup both are `http://localhost:8080`.

The backend has independent MySQL and PostgreSQL Drizzle schemas, including Better Auth's required persistence tables. Keep application schema changes in both database folders if both providers should stay supported.

## Docker layout

```text
.
  .env.example             Single shared environment template
  docker-compose.yml        MySQL, PostgreSQL, API, and web services
  back-starter/             Express + Better Auth + Drizzle (JavaScript)
  frontend/                 React + Tailwind CSS + esbuild (JavaScript)
```

Only the root `.env` is used for project configuration. It is ignored by Git and is not copied into the backend Docker image; Compose injects its values into the API container. Do not use the example development passwords or secret in production.
