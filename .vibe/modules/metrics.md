# Module: metrics

**Role:** Fetches and displays the list of metrics exposed by the selected machine on the connected Prometheus server, with loading, empty (machine-specific message) and error states. Once loaded, the list can be further narrowed client-side by a case-insensitive text search, with a distinct "no match" message when nothing fits.
**Files:** `src/features/metrics/MetricList.tsx`
**Exports:** `MetricList({ baseUrl: string, machine: string })` — React component; re-fetches whenever `baseUrl` or `machine` changes.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
