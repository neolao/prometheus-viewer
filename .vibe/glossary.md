# Ubiquitous Language

## Metric
A named time series exposed by the connected Prometheus server (e.g. `http_requests_total`). The app's core purpose is to let a user discover and inspect these metrics — the current feature set fetches and displays the list of metric names exposed by the selected [Machine](#machine), scoped server-side via a `match[]={host="<machine>"}` selector rather than the full, unfiltered list from the server. Clicking a metric reveals its Prometheus type and description, fetched on demand for that one metric.
_Sources: `src/api/prometheus.ts`, `src/features/metrics/MetricList.tsx`, `src/features/metrics/MetricDetails.tsx`_

## Machine
The physical or virtual host the user chooses to work on, derived from the `host` label values exposed by the connected Prometheus server (not the `instance` label, which on this server identifies probe targets rather than hosts — see `decisions/004`). Selecting a machine gates and contextualizes the rest of the navigation, and scopes the [Metric](#metric) list to only what that machine exposes.
**Do not confuse with:** [Metric](#metric) — a machine is the context a metric is queried within, not the measurement itself.
_Sources: `src/api/prometheus.ts`, `src/features/machines/MachineSelector.tsx`, `src/App.tsx`_
