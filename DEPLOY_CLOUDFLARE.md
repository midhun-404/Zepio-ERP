# Deploying Zepio ERP to Cloudflare

This guide explains how to deploy Zepio ERP using **Cloudflare Pages** (Frontend) and **Cloudflare Workers** (Backend).

## 1. Prerequisites
- Cloudflare Account
- Node.js & npm installed
- `wrangler` CLI installed (`npm install -g wrangler`)
- **Important**: Cloudflare Workers does NOT support local SQLite files. You must use a remote database (Postgres/MySQL) or Cloudflare D1.

## 2. Backend Deployment (Workers)

The backend is configured in `server/wrangler.toml`.

### Step 2.1: Database Setup
Since `sqlite3` cannot run on Workers, you must:
1.  Provision a remote database (e.g., Neon Postgres, Supabase, or Turso).
2.  Get the Connection String (URI).
3.  Set it as a secret in Cloudflare:
    ```bash
    cd server
    wrangler secret put DATABASE_URL
    # Enter your connection string (e.g., postgres://user:pass@host/db)
    ```

### Step 2.2: Deploy
```bash
cd server
npm install
wrangler deploy
```
*Note: The first deployment will publish the `src/worker.js` shim. For full Express functionality, you may need to perform additional code adaptation to replace `app.listen` with a proper serverless adapter.*

## 3. Frontend Deployment (Pages)

The frontend is a Vite app located in `client`.

### Step 3.1: Build
```bash
cd client
npm run build
```
This enables the `dist` folder.

### Step 3.2: Configure Proxy
Open `client/public/_redirects` and uncomment the proxy line, replacing with your **actual** Worker URL from Step 2.2:
```text
/api/*  https://zepio-erp-server.your-subdomain.workers.dev/:splat  200
```
*Re-run `npm run build` after editing this file.*

### Step 3.3: Deploy
```bash
wrangler pages deploy dist --project-name zepio-client
```

## 4. Verification
1.  Visit your Pages URL.
2.  The app should load.
3.  API requests (login, dashboard) should forward to the Worker.
4.  If using a remote DB, ensure migrations are run (you may need to run `npx sequelize-cli db:migrate` locally against the remote URL).
