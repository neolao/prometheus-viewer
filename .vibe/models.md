# Data models

## PrometheusLabelValuesResponse
| Field | Type | Notes |
|---|---|---|
| status | `"success" \| "error"` | Prometheus API result status |
| data | `string[]` (optional) | Metric names, present on success |
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
