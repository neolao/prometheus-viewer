# central

Docker Compose stack for the central monitoring server: it receives metrics
pushed by the machines running `agent/`, evaluates alerting rules, and sends
notifications. This is the server-side counterpart consumed by
`prometheus-viewer` (via `PROMETHEUS_URL` and Basic Auth credentials).

## Services

- **victoriametrics** — Prometheus-compatible time-series database, storage backend for all metrics
- **blackbox_exporter** — probes external websites (HTTP checks) for `vmagent` to scrape
- **vmagent** — scrapes `blackbox_exporter` and remote-writes the results into VictoriaMetrics
- **vmalert** — evaluates the PromQL alerting rules in `vmalert/rules.yml` and notifies `alertmanager`
- **alertmanager** — routes alerts to Telegram (see `alertmanager/alertmanager.yml`)
- **caddy** — reverse proxy with automatic TLS; splits access into three Basic Auth scopes (admin, write, read — see `Caddyfile`)

## Files

- `docker-compose.yml` — service definitions
- `.env.example` — template for `DOMAIN` and the admin/write/read credentials (copy to `.env`)
- `Caddyfile` — routing and Basic Auth rules
- `alertmanager/alertmanager.yml` — Telegram notification config (bot token/chat id must be filled in directly, not via `.env`)
- `blackbox/blackbox.yml` — HTTP probe module used to check website availability
- `vmagent/scrape.yml` — list of websites to probe
- `vmalert/rules.yml` — alerting rules (host down, low disk, high CPU, site down/slow)

## Usage

```
cp .env.example .env   # fill in DOMAIN and generate the password hashes
docker compose up -d
```
