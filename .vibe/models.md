# Data models

## PrometheusLabelValuesResponse
| Field | Type | Notes |
|---|---|---|
| status | `"success" \| "error"` | Prometheus API result status |
| data | `string[]` (optional) | Label values (metric names or machine/host names, depending on the queried label), present on success |
| error | `string` (optional) | Error message, present on error |
| errorType | `string` (optional) | Prometheus error category, present on error |

Defined in: `src/api/prometheus.ts`

## MetricList load state
| Field | Type | Notes |
|---|---|---|
| status | `"loading" \| "success" \| "error"` | Discriminant |
| metricNames | `string[]` | Present when `status === "success"` |
| message | `string` | Present when `status === "error"` |

Defined in: `src/features/metrics/MetricList.tsx`

## MachineSelector load state
| Field | Type | Notes |
|---|---|---|
| status | `"loading" \| "success" \| "error"` | Discriminant |
| machines | `string[]` | Present when `status === "success"` — `host` label values |
| message | `string` | Present when `status === "error"` |

Defined in: `src/features/machines/MachineSelector.tsx`

## CreateAppOptions
| Field | Type | Notes |
|---|---|---|
| prometheusUrl | `string` | Real Prometheus server the proxy relays to |
| prometheusUsername | `string` (optional) | Injected as HTTP Basic auth when paired with `prometheusPassword` |
| prometheusPassword | `string` (optional) | Never sent to or read by the client |
| viteMiddleware | `RequestHandler` (optional) | Dev mode — Vite's middleware-mode handler |
| distDir | `string` (optional) | Prod mode — directory of the built static frontend |

Defined in: `server/createApp.ts`
