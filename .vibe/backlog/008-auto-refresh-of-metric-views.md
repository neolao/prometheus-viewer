---
status: todo
---
# Auto-Refresh Of Metric Views

## Description
The current value and the evolution chart of the selected metric are only loaded once. Add an auto-refresh mechanism with a user-selected interval (off / 5s / 30s / 1min) so the views stay up to date without manual reloading, plus a pause/resume control.

## Acceptance Criteria
- [ ] User can pick a refresh interval (off / 5s / 30s / 1min) and the current value and chart reload automatically at that pace
- [ ] User can pause and resume the auto-refresh at any time
- [ ] A failed refresh (network error, non-2xx response, malformed payload) keeps the last displayed data visible and signals the error instead of blanking the view
- [ ] Auto-refresh stops when the metric view is closed or the metric/machine selection changes (no orphan timers or stale requests)

## Notes
Refresh timers must be cleaned up on unmount to avoid leaks. Concurrent responses arriving out of order must not overwrite fresher data with staler data.
