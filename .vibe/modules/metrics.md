# Module: metrics

**Role:** Fetches and displays the list of metrics exposed by the selected machine on the connected Prometheus server, with loading, empty (machine-specific message) and error states. Once loaded, the list can be further narrowed client-side by a case-insensitive text search, with a distinct "no match" message when nothing fits. Clicking a metric in the list selects it and shows its type and description below, fetched on demand for that one metric.
**Files:** `src/features/metrics/MetricList.tsx`, `src/features/metrics/MetricDetails.tsx`
**Exports:**
- `MetricList({ baseUrl: string, machine: string })` — React component; re-fetches whenever `baseUrl` or `machine` changes; clears the selected metric on re-fetch.
- `MetricDetails({ baseUrl: string, metricName: string })` — React component rendered by `MetricList` for the currently selected metric; handles loading, success (type + help text), no-metadata-available, and error states; re-fetches whenever `metricName` changes.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
