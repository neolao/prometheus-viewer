# Module: api-prometheus

**Role:** HTTP client for the Prometheus HTTP API.
**Files:** `src/api/prometheus.ts`
**Exports:**
- `fetchMetricNames(baseUrl: string, credentials?: PrometheusCredentials): Promise<string[]>` — fetches all metric names via `GET {baseUrl}/api/v1/label/__name__/values`, sending an HTTP Basic `Authorization` header when `credentials` is provided. Throws on a non-ok HTTP response (e.g. `401` on rejected credentials) or on a Prometheus `status: "error"` payload.
- `PrometheusCredentials` — `{ username: string; password: string }`

**Depends on:** none
