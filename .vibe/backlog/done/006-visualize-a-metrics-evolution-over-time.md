---
status: todo
depends_on: [005]
---
# Visualize A Metric's Evolution Over Time

## Description
For the selected metric and machine, the user must be able to visualize the value's evolution over time as a graph, via a range query `GET {baseUrl}/api/v1/query_range`, with a time range selector (last hour / 6h / 24h / 7 days, or custom bounds) driving the `start`/`end`/`step` parameters.

## Acceptance Criteria
- [ ] A graph displays the selected metric's evolution over time, for the selected machine
- [ ] The user can pick a predefined time range (last hour / 6h / 24h / 7 days) that reloads the graph accordingly
- [ ] The user can set custom time bounds (start/end) for the graph
- [ ] If the call to `/api/v1/query_range` fails (network error, non-2xx response, invalid payload) or returns no data for the chosen range, a clear message is shown instead of an unexplained empty graph

## Notes
Prometheus endpoint: `GET {baseUrl}/api/v1/query_range`, parameters `start`, `end`, `step`. Builds on the instant-value feature (item 005) for metric/machine selection.
