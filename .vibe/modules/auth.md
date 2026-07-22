# Module: auth

**Role:** Collects an optional username/password from the user before the metrics view loads, for Prometheus servers that require HTTP Basic Auth. Credentials are held only in memory (component state) — never persisted by the app; the form relies on the browser's own password manager for "remember me" (see [`decisions/002-basic-auth-credentials-not-persisted.md`](../decisions/002-basic-auth-credentials-not-persisted.md)).
**Files:** `src/features/auth/LoginForm.tsx`
**Exports:** `LoginForm({ onSubmit: (credentials) => void, onSkip: () => void })` — React component; blocks submission with a validation message if either field is empty.
**Depends on:** none
