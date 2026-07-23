# agent

Files to deploy on every machine that should report its metrics to the
central monitoring server (`central/`).

## Files

- `monitoring-agent.sh` — collects CPU, RAM, disk free space, uptime, and a
  heartbeat timestamp, then pushes them to VictoriaMetrics on `central/` via
  an authenticated HTTP POST (Prometheus exposition format)
- `monitoring-agent.conf.example` — config template (domain, write
  credentials, optional host name override)

## Usage

```
cp monitoring-agent.sh /usr/local/bin/monitoring-agent.sh
chmod +x /usr/local/bin/monitoring-agent.sh

cp monitoring-agent.conf.example /etc/monitoring-agent.conf
chmod 600 /etc/monitoring-agent.conf   # edit it with the real domain/credentials

# Run every 2 minutes via cron:
*/2 * * * * /usr/local/bin/monitoring-agent.sh
```
