# Module: api-prometheus

**Role:** Client-side HTTP calls to this app's own server-side Prometheus proxy (see [`modules/server.md`](server.md)) — never calls a Prometheus server directly. Both exports share an internal label-values helper and the same error handling (throws on a non-ok HTTP response or on a Prometheus `status: "error"` payload).
**Files:** `src/api/prometheus.ts`
**Exports:**
- `fetchMetricNames(baseUrl: string): Promise<string[]>` — fetches all metric names via `GET {baseUrl}/api/v1/label/__name__/values`.
- `fetchInstances(baseUrl: string): Promise<string[]>` — fetches all known `instance` label values (machines) via `GET {baseUrl}/api/v1/label/instance/values`.
**Depends on:** none
