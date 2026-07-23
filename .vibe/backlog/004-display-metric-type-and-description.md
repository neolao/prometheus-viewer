---
status: in_progress
depends_on: [001]
---
# Display Metric Type And Description

## Description
Clicking a metric in the list must let the user view its Prometheus type (`counter`, `gauge`, `histogram`, `summary`, …) and its help text (`HELP`), fetched via `GET {baseUrl}/api/v1/metadata`.

## Acceptance Criteria
- [ ] Clicking a metric in the list displays its type and description (HELP)
- [ ] If metadata is not available for the selected metric, a clear message is shown instead of an empty section
- [ ] If the call to `/api/v1/metadata` fails (network error, non-2xx response, invalid payload), a clear error message is shown

## Notes
Prometheus endpoint: `GET {baseUrl}/api/v1/metadata`. This endpoint had been deferred for v1 in decision `.vibe/decisions/001-prometheus-metric-list-endpoint.md` ("can be adopted later if metric metadata becomes a requirement") — that requirement now exists.
