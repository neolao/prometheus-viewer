# Module: server

**Role:** Node.js server used in both development and production. Serves the frontend (Vite dev middleware in dev, the static `dist/` build in prod) and proxies `/prom-api/*` to the real Prometheus server, injecting an HTTP Basic `Authorization` header itself from server-only environment variables — the browser never handles or sends Prometheus credentials. Same-origin proxying also sidesteps CORS entirely, since the browser only ever talks to this server.
**Files:** `server/index.ts` (entry point, reads env, wires dev/prod mode), `server/createApp.ts` (builds the Express app; pure factory, no side effects, used directly in tests)
**Exports:**
- `createApp({ prometheusUrl, prometheusUsername?, prometheusPassword?, viteMiddleware?, distDir? }): Express` — `viteMiddleware` for dev, `distDir` for prod (mutually exclusive in practice)

**Config (env vars, server-only, no `VITE_` prefix):** `PROMETHEUS_URL`, `PROMETHEUS_USERNAME` (optional), `PROMETHEUS_PASSWORD` (optional), `PORT` (optional, default 3000)
**Depends on:** none
