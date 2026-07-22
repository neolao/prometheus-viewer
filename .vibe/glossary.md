# Ubiquitous Language

## Metric
A named time series exposed by the connected Prometheus server (e.g. `http_requests_total`). The app's core purpose is to let a user discover and, over time, inspect these metrics — the current feature set fetches and displays the list of metric names available on the server.
_Sources: `src/api/prometheus.ts`, `src/features/metrics/MetricList.tsx`_
