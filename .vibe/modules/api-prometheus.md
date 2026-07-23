# Module: api-prometheus

**Role:** Client-side HTTP calls to this app's own server-side Prometheus proxy (see [`modules/server.md`](server.md)) — never calls a Prometheus server directly. Both exports share an internal label-values helper and the same error handling (throws on a non-ok HTTP response or on a Prometheus `status: "error"` payload).
**Files:** `src/api/prometheus.ts`
**Exports:**
- `fetchMetricNames(baseUrl: string, machine?: string): Promise<string[]>` — fetches metric names via `GET {baseUrl}/api/v1/label/__name__/values`; when `machine` is given, scopes the results with a `match[]={host="<machine>"}` selector.
- `fetchMachines(baseUrl: string): Promise<string[]>` — fetches all known machine names via `GET {baseUrl}/api/v1/label/host/values` (the `host` label identifies a monitored machine; see `decisions/004`).
- `fetchMetricValue(baseUrl: string, metricName: string, machine: string): Promise<MetricSample[]>` — fetches a metric's current value via an instant query `GET {baseUrl}/api/v1/query`, scoped to the machine with a `{host="<machine>"}` selector (same `host` label as `fetchMachines`/`fetchMetricNames`, not `instance` — consistent with `decisions/004`); one `MetricSample` per returned series, empty array when the metric has no current value; throws on a non-ok HTTP response, a Prometheus `status: "error"` payload, or a malformed success payload (missing/non-array result).
**Depends on:** none
