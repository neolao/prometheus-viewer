# Ubiquitous Language

## Metric
A named time series exposed by the connected Prometheus server (e.g. `http_requests_total`). The app's core purpose is to let a user discover and, over time, inspect these metrics — the current feature set fetches and displays the list of metric names available on the server.
_Sources: `src/api/prometheus.ts`, `src/features/metrics/MetricList.tsx`_

## Machine
The physical or virtual host the user chooses to work on, derived from the `host` label values exposed by the connected Prometheus server (not the `instance` label, which on this server identifies probe targets rather than hosts — see `decisions/004`). Selecting a machine gates and contextualizes the rest of the navigation (metric list, values, graphs).
**Do not confuse with:** [Metric](#metric) — a machine is the context a metric is queried within, not the measurement itself.
_Sources: `src/api/prometheus.ts`, `src/features/machines/MachineSelector.tsx`, `src/App.tsx`_
