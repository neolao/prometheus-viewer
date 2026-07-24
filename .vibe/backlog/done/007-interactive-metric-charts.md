---
status: done
---
# Interactive Metric Charts

## Description
The metric evolution chart is currently a static rendering. Make it interactive so the user can explore the data directly on the chart: a hover tooltip showing the timestamp and the value of each series at that point, zooming by selecting a time range on the chart itself, and toggling the visibility of individual series through the legend.

## Acceptance Criteria
- [ ] Hovering the chart displays a tooltip with the timestamp and the value of each visible series at that point
- [ ] User can select a time range directly on the chart to zoom in, which reloads the data for the selected bounds
- [ ] User can toggle each series' visibility by clicking its entry in the legend
- [ ] With no data or a single data point, interactions degrade gracefully (no crash, no misleading tooltip)

## Notes
Builds on the evolution chart introduced in item 006. Zooming should reuse the existing range-query flow (`/api/v1/query_range` with `start`/`end`/`step`) rather than only scaling the already-loaded points.
