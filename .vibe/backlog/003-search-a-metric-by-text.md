---
status: in_progress
depends_on: [002]
---
# Search A Metric By Text

## Description
The user must be able to filter the already-displayed metric list (itself filtered by the selected machine, see item 002) by text, to quickly find a metric in a potentially long list. Filtering happens client-side, with no new network call.

## Acceptance Criteria
- [ ] A search field is available above the metric list
- [ ] Typing text live-filters the list to only show metrics whose name contains the typed text
- [ ] Clearing the search field shows the full list again (filtered by machine)
- [ ] If no metric matches the typed text, a clear message is shown instead of an unexplained empty list

## Notes
Purely client-side filtering on the list already loaded by `MetricList` — no additional network call.
