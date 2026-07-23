# prometheus-viewer

A web UI to visualize Prometheus metrics and run PromQL queries.

## Repository layout

- `src/`, `server/` — the app itself (frontend + Node.js proxy server)
- [`central/`](central/README.md) — Docker Compose stack for the central monitoring server (VictoriaMetrics, Alertmanager, etc.), the data source this app connects to
- [`agent/`](agent/README.md) — script to deploy on each machine to report its metrics to `central/`