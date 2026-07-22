# Module: api-prometheus

**Role:** HTTP client for the Prometheus HTTP API.
**Files:** `src/api/prometheus.ts`
**Exports:** `fetchMetricNames(baseUrl: string): Promise<string[]>` — fetches all metric names via `GET {baseUrl}/api/v1/label/__name__/values`, throws on a non-ok HTTP response or on a Prometheus `status: "error"` payload.
**Depends on:** none
