---
status: in_progress
depends_on: [001]
---
# View The Current Value Of A Metric

## Description
Clicking a metric must let the user see its current value for the selected machine (item 001), via an instant query `GET {baseUrl}/api/v1/query` filtered on that machine.

## Acceptance Criteria
- [ ] Clicking a metric triggers an instant query filtered on the selected machine and displays its current value
- [ ] If the metric returns multiple series (different labels within the same machine), each series and its value are displayed separately
- [ ] If the metric has no current value for the selected machine, a clear message is shown instead of a blank screen
- [ ] If the call to `/api/v1/query` fails (network error, non-2xx response, invalid payload), a clear error message is shown

## Notes
Prometheus endpoint: `GET {baseUrl}/api/v1/query` with a PromQL expression built from the metric name and the `instance` label.
