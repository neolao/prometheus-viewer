---
date: 2026-07-23
status: accepted
---
# Drop the metric type/description feature (backlog item 004)

**Context:** Backlog item 004 implemented showing a metric's Prometheus type and help text via `GET {baseUrl}/api/v1/metadata`, scoped lazily per metric (decision `005`). Runtime verification against the user's real deployment (`central/`) showed the endpoint always returns 404.

**Decision:** Remove the feature entirely (the `MetricDetails` component, `fetchMetricMetadata`, and the click-to-select behavior in the metric list) rather than keep it in a permanently-broken state.

**Reason:** The user's monitoring stack (`central/`) stores metrics in VictoriaMetrics, not Prometheus. VictoriaMetrics does not retain per-metric `TYPE`/`HELP` metadata at all — machines push samples over HTTP rather than being scraped, so this metadata never reaches storage, and VictoriaMetrics has no metadata store to serve it from even when data does arrive by scrape (e.g. `blackbox_exporter` via `vmagent`). On top of that, the Caddy reverse proxy in front of it (`central/Caddyfile`) only allowlists `/api/v1/query*`, `/api/v1/label*`, and `/api/v1/series*` for reads — `/api/v1/metadata` falls through to its catch-all 404. This is not a configuration bug to fix; `/api/v1/metadata` has no data behind it on this stack.

**Rejected alternatives:**
- Keep the feature and just show a clearer "not supported by this server" message — rejected because the feature would never work for this user and would only add dead UI weight.
- Wait for a possible future migration to Prometheus itself before deciding — rejected; the user chose to remove the feature now rather than carry unused code.
