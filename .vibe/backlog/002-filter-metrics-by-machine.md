---
status: in_progress
depends_on: [001]
---
# Filter Metrics By Machine

## Description
Once a machine is selected (item 001), the metric list rendered by `MetricList` should only show metrics actually exposed by that machine, instead of the full list from the Prometheus server. This is done by passing a `match[]={instance="<machine>"}` filter to the existing `GET {baseUrl}/api/v1/label/__name__/values` endpoint.

## Acceptance Criteria
- [ ] After selecting a machine, the displayed metric list only contains metrics exposed by that machine
- [ ] Filtering uses the `match[]` parameter of the existing `/api/v1/label/__name__/values` endpoint, without introducing a new endpoint
- [ ] If the selected machine exposes no metrics, a clear message is shown instead of an unexplained empty list
- [ ] Changing the selected machine updates the metric list accordingly

## Notes
Builds on the existing `src/features/metrics/MetricList.tsx` and `src/api/prometheus.ts` client. Extends the already-used network call (decision `.vibe/decisions/001-prometheus-metric-list-endpoint.md`) rather than replacing it.
