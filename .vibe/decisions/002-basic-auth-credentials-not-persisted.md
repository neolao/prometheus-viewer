---
date: 2026-07-23
status: accepted
---
# Rely on the browser's password manager, never persist credentials ourselves

**Context:** Adding HTTP Basic Auth support for connecting to a protected Prometheus server. The user asked for a "remember me" convenience.

**Decision:** Do not implement any application-level credential storage (no `localStorage`, no `sessionStorage`, no cookie). Credentials live only in React state for the lifetime of the page. The login form uses standard `<form>` semantics with `autocomplete="username"` / `autocomplete="current-password"` so the browser's own password manager can offer to save and autofill them.

**Reason:** This project is a client-only SPA — any `VITE_`-prefixed env var or app-managed storage is either baked into the public JS bundle or plaintext-readable by any script running on the page (XSS). The browser's built-in credential manager is the standard, already-hardened mechanism for this exact use case, and gives the requested "remember me" convenience without the app taking on the risk of storing a password itself.

**Rejected alternatives:**
- `VITE_PROMETHEUS_USERNAME` / `VITE_PROMETHEUS_PASSWORD` env vars — leaks the password in the shipped JS bundle, visible to anyone viewing page source.
- Storing credentials in `localStorage`/`sessionStorage` — plaintext, persists on-disk or in-tab, exposed to any XSS on the page.
