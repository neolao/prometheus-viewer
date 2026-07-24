---
status: todo
---
# Pin Favorite Metrics

## Description
Users who monitor the same metrics every day have to search for them again on each visit. Let the user pin metrics as favorites so they appear first in the metric list, persisted across sessions.

## Acceptance Criteria
- [ ] User can pin and unpin a metric directly from the metric list
- [ ] Pinned metrics are displayed at the top of the list (or in a dedicated section), visually distinguished from the rest
- [ ] Favorites persist after a full page reload
- [ ] A favorite metric that is not exposed by the currently selected machine is handled gracefully (hidden or clearly marked as unavailable, no error)

## Notes
Client-side persistence (localStorage) is the suggested mechanism — the server has no database. Decide at implementation time whether favorites are global or scoped per machine.
