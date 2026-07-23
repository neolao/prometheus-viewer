# Module: metrics

**Role:** Fetches and displays the list of metrics exposed by the selected machine on the connected Prometheus server, with loading, empty (machine-specific message) and error states.
**Files:** `src/features/metrics/MetricList.tsx`
**Exports:** `MetricList({ baseUrl: string, machine: string })` — React component; re-fetches whenever `baseUrl` or `machine` changes.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
