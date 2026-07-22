# Module: metrics

**Role:** Fetches and displays the list of metrics available on the connected Prometheus server, with loading, empty and error states.
**Files:** `src/features/metrics/MetricList.tsx`
**Exports:** `MetricList({ baseUrl: string })` — React component; re-fetches whenever `baseUrl` changes.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
