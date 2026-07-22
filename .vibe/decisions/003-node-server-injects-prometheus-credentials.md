---
date: 2026-07-23
status: accepted
---
# Run a Node.js server (dev and prod) that injects Prometheus credentials

**Context:** The app was a client-only SPA. Two problems came from that: (1) the real Prometheus deployment sits behind a reverse proxy with no CORS headers, so the browser blocks the direct cross-origin `fetch` outright; (2) the only place to hold Basic Auth credentials was the browser (a per-user login form, see superseded [002](002-basic-auth-credentials-not-persisted.md)), which the user decided is unwanted — a single set of credentials, configured once, is enough.

**Decision:** Introduce a Node.js server that is used in both development and production. It serves the frontend (Vite in middleware mode during dev, the static `dist/` build in prod) and proxies `/prom-api/*` to the real Prometheus server, injecting a `Authorization: Basic …` header itself from `PROMETHEUS_USERNAME`/`PROMETHEUS_PASSWORD` environment variables (no `VITE_` prefix — never read by client code, never shipped to the browser). The client now only ever calls the same-origin `/prom-api` path with no credentials of its own. The login form is removed.

**Reason:** Same-origin requests eliminate the CORS problem entirely — there is no cross-origin call left in production. Server-only env vars (Node's `process.env`, not Vite's `import.meta.env`) never reach the client bundle, which is a stronger guarantee than anything achievable purely in the browser. Using the same server codebase in dev and prod (Vite mounted as middleware) avoids maintaining two divergent proxy mechanisms.

**Rejected alternatives:**
- Keep the client-only SPA and rely on each Prometheus deployment enabling CORS — outside this app's control, and the user's own deployment doesn't do it.
- Keep the per-user login form and only add the dev-time Vite proxy (already built for local testing) — doesn't solve CORS in production, since there is no Node process serving the static build in a plain SPA deployment.
