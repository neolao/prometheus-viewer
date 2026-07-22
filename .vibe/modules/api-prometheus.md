# Module: api-prometheus

**Role:** Client-side HTTP call to this app's own server-side Prometheus proxy (see [`modules/server.md`](server.md)) — never calls a Prometheus server directly.
**Files:** `src/api/prometheus.ts`
**Exports:** `fetchMetricNames(baseUrl: string): Promise<string[]>` — fetches all metric names via `GET {baseUrl}/api/v1/label/__name__/values`. Throws on a non-ok HTTP response or on a Prometheus `status: "error"` payload.
**Depends on:** none
