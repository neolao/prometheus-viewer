---
date: 2026-07-22
status: accepted
---
# Use the label values endpoint to list available metrics

**Context:** Implementing the first feature that connects to a Prometheus server and displays the list of available metrics.

**Decision:** Fetch the metric list via `GET {baseUrl}/api/v1/label/__name__/values`, which returns a flat array of metric name strings.

**Reason:** It is the lightest and most direct Prometheus HTTP API endpoint for metric name discovery — a single flat list matching exactly what this feature needs to render.

**Rejected alternatives:** `GET {baseUrl}/api/v1/metadata` — returns type/help metadata grouped per metric, which is richer but heavier and unnecessary for a simple name list; can be adopted later if metric metadata becomes a requirement.
