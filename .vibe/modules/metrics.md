# Module: metrics

**Role:** Fetches and displays the list of metrics exposed by the selected machine on the connected Prometheus server, with loading, empty (machine-specific message) and error states. Once loaded, the list can be further narrowed client-side by a case-insensitive text search, with a distinct "no match" message when nothing fits. Clicking a metric name reveals its current value on the selected machine, shown inline below that metric; only one metric's value is shown at a time, and the selection resets whenever the machine (and thus the list) changes.
**Files:** `src/features/metrics/MetricList.tsx`, `src/features/metrics/MetricValue.tsx`
**Exports:**
- `MetricList({ baseUrl: string, machine: string })` — React component; re-fetches whenever `baseUrl` or `machine` changes.
- `MetricValue({ baseUrl: string, machine: string, metricName: string })` — React component, rendered by `MetricList` for the clicked metric; fetches and displays that metric's current value(s) on the machine, with loading, one-line-per-series success, "no current value" and error states; re-fetches whenever any prop changes.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
