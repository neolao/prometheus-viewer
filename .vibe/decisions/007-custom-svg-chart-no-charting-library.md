---
date: 2026-07-24
status: accepted
---
# Render the metric evolution graph with a hand-rolled SVG chart, not a charting library

**Context:** Backlog item 006 requires displaying a metric's value over time as a graph, with a predefined/custom time range selector.

**Decision:** Implement the chart as a small React component rendering plain inline SVG (axes, one polyline per series), with no external charting dependency.

**Reason:** The chart requirement is simple (line chart, multiple series, no need for interactive tooltips/zoom/animation). A hand-rolled SVG component keeps the bundle small and avoids adding a new dependency to track for vulnerabilities and updates. Confirmed with the user before implementation.

**Rejected alternatives:** A dedicated charting library (e.g. Recharts) — richer rendering (tooltips, animations) but adds a maintenance and security-surface cost disproportionate to the current need.
