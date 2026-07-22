# Module: metrics

**Role:** Fetches and displays the list of metrics available on the connected Prometheus server, with loading, empty and error states.
**Files:** `src/features/metrics/MetricList.tsx`
**Exports:** `MetricList({ baseUrl: string, credentials?: PrometheusCredentials })` — React component; re-fetches whenever `baseUrl` or `credentials` change.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
