---
date: 2026-07-23
status: accepted
---
# Fetch metric metadata lazily, scoped to one metric at a time

**Context:** Backlog item 004 requires showing a metric's Prometheus type and help text when the user clicks it in the list. Decision `001` had deferred adopting `/api/v1/metadata` because the initial feature only needed metric names.

**Decision:** Call `GET {baseUrl}/api/v1/metadata?metric=<name>` on demand, only when the user clicks a specific metric, rather than fetching metadata for the whole metric list upfront.

**Reason:** Metadata for every exposed metric can be a heavy payload on servers with many metrics; scoping the call to the single selected metric keeps the list view fast and only pays the cost when the user actually wants the detail.

**Rejected alternatives:** Fetching `/api/v1/metadata` for all metrics upfront alongside the name list — simpler data flow, but wastes bandwidth for metrics the user never inspects and slows down the initial list render.
