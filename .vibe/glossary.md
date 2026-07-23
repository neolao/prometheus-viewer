# Ubiquitous Language

## Metric
A named time series exposed by the connected Prometheus server (e.g. `http_requests_total`). The app's core purpose is to let a user discover and, over time, inspect these metrics — the current feature set fetches and displays the list of metric names exposed by the selected [Machine](#machine), scoped server-side via a `match[]={host="<machine>"}` selector rather than the full, unfiltered list from the server.
_Sources: `src/api/prometheus.ts`, `src/features/metrics/MetricList.tsx`_

## Machine
The physical or virtual host the user chooses to work on, derived from the `host` label values exposed by the connected Prometheus server (not the `instance` label, which on this server identifies probe targets rather than hosts — see `decisions/004`). Selecting a machine gates and contextualizes the rest of the navigation, and scopes the [Metric](#metric) list to only what that machine exposes.
**Do not confuse with:** [Metric](#metric) — a machine is the context a metric is queried within, not the measurement itself.
_Sources: `src/api/prometheus.ts`, `src/features/machines/MachineSelector.tsx`, `src/App.tsx`_

## Series
One specific label combination under which a [Metric](#metric) is reported for the selected [Machine](#machine) at a point in time, together with its current value — the result of clicking a metric in the list. A metric can resolve to several series at once on the same machine (e.g. one per HTTP method or status code); each is shown separately with its own value, and a metric with no series currently reported shows a clear "no current value" message instead.
**Do not confuse with:** [Metric](#metric) — a metric is the named measurement definition; a series is one concrete labeled instance of it currently reporting a value.
_Sources: `src/api/prometheus.ts`, `src/features/metrics/MetricValue.tsx`_
