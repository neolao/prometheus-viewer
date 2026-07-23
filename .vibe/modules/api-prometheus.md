# Module: api-prometheus

**Role:** Client-side HTTP calls to this app's own server-side Prometheus proxy (see [`modules/server.md`](server.md)) — never calls a Prometheus server directly. All exports share an internal fetch helper (`fetchPrometheusApi`) with common error handling (throws on a non-ok HTTP response or on a Prometheus `status: "error"` payload).
**Files:** `src/api/prometheus.ts`
**Exports:**
- `fetchMetricNames(baseUrl: string, machine?: string): Promise<string[]>` — fetches metric names via `GET {baseUrl}/api/v1/label/__name__/values`; when `machine` is given, scopes the results with a `match[]={host="<machine>"}` selector.
- `fetchMachines(baseUrl: string): Promise<string[]>` — fetches all known machine names via `GET {baseUrl}/api/v1/label/host/values` (the `host` label identifies a monitored machine; see `decisions/004`).
- `fetchMetricMetadata(baseUrl: string, metricName: string): Promise<MetricMetadata | null>` — fetches a single metric's type and help text via `GET {baseUrl}/api/v1/metadata?metric=<name>`, scoped to one metric at a time rather than fetched upfront for the whole list (see `decisions/005`); returns `null` when Prometheus has no metadata for that metric.
**Depends on:** none
