---
status: done
---
# Select A Prometheus Machine

## Description
Before the metric list is shown, the user must be able to choose the machine (Prometheus instance) to work on. The possible values are fetched via `GET {baseUrl}/api/v1/label/instance/values`, and the user's choice becomes the context for the rest of the flow (metric filtering, values, graphs).

## Acceptance Criteria
- [ ] The user sees the list of available machines, derived from the `instance` label values of the connected Prometheus server
- [ ] The user can select a machine from that list
- [ ] The selected machine stays visible/accessible throughout the rest of the navigation
- [ ] If no machine is available (empty list) or the call fails, a clear message is shown instead of a blank screen or an unhandled error

## Notes
Prometheus endpoint: `GET {baseUrl}/api/v1/label/instance/values`. This step precedes and gates the metric list display (see item 002).
