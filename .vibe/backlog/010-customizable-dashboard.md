---
status: todo
---
# Customizable Dashboard

## Description
Add a dashboard page where the user composes their own monitoring view: they can add widgets (the current value or the evolution chart of a chosen metric on a chosen machine), remove them, and rearrange their layout. The dashboard configuration persists across sessions so the user finds their setup back on every visit.

## Acceptance Criteria
- [ ] User can add a widget by choosing a machine, a metric, and a display type (current value or chart)
- [ ] User can remove a widget and rearrange the widgets' order/layout
- [ ] The dashboard configuration persists after a full page reload
- [ ] An empty dashboard displays a clear call to action instead of a blank page

## Notes
Client-side persistence (localStorage) is the suggested mechanism — the server has no database. Widgets should reuse the existing current-value and evolution-chart components rather than reimplementing them.
