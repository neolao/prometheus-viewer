#!/bin/bash
# Monitoring agent — collects CPU/RAM/disk/uptime + heartbeat, pushes to VictoriaMetrics.
# Run via cron, e.g.: */2 * * * * /usr/local/bin/monitoring-agent.sh

set -euo pipefail

CONF_FILE="/etc/monitoring-agent.conf"
if [[ ! -f "$CONF_FILE" ]]; then
	echo "Missing config: $CONF_FILE" >&2
	exit 1
fi
# shellcheck source=/etc/monitoring-agent.conf
source "$CONF_FILE"

HOST="${HOST_NAME:-$(hostname)}"
ENDPOINT="https://${DOMAIN}/api/v1/import/prometheus"
TIMESTAMP="$(date +%s)"

# --- CPU: measured over 1 second via /proc/stat ---
read -r _ u1 n1 s1 i1 w1 irq1 sirq1 _ < /proc/stat
sleep 1
read -r _ u2 n2 s2 i2 w2 irq2 sirq2 _ < /proc/stat

prev_idle=$((i1 + w1))
idle=$((i2 + w2))
prev_total=$((u1 + n1 + s1 + i1 + w1 + irq1 + sirq1))
total=$((u2 + n2 + s2 + i2 + w2 + irq2 + sirq2))

total_diff=$((total - prev_total))
idle_diff=$((idle - prev_idle))

if [[ "$total_diff" -gt 0 ]]; then
	cpu_usage=$(( (1000 * (total_diff - idle_diff) / total_diff + 5) / 10 ))
else
	cpu_usage=0
fi

# --- RAM: percentage used ---
mem_total=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
mem_available=$(awk '/MemAvailable/ {print $2}' /proc/meminfo)
mem_usage=$(( (1000 * (mem_total - mem_available) / mem_total + 5) / 10 ))

# --- Disk: percentage free on / ---
disk_free=$(df -P / | awk 'NR==2 {gsub("%","",$5); print 100 - $5}')

# --- Uptime in seconds ---
uptime_seconds=$(awk '{print int($1)}' /proc/uptime)

# --- Building the payload (Prometheus exposition format) ---
payload=$(cat << EOF
host_last_seen_timestamp{host="${HOST}"} ${TIMESTAMP}
cpu_usage_percent{host="${HOST}"} ${cpu_usage}
mem_usage_percent{host="${HOST}"} ${mem_usage}
disk_free_percent{host="${HOST}",mountpoint="/"} ${disk_free}
uptime_seconds{host="${HOST}"} ${uptime_seconds}
EOF
)

# --- Sending ---
curl -s -o /dev/null -w "%{http_code}" \
	-u "${WRITE_USER}:${WRITE_PASS}" \
	--data-binary "${payload}" \
	"${ENDPOINT}" | grep -q "^204$" || echo "Failed to send to ${ENDPOINT}" >&2
