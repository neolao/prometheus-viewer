---
status: todo
---
# Suggest Additional Monitoring Exporters

## Description
Machines often run services that could be monitored but are not yet scraped by Prometheus — for example Syncthing, which exposes a built-in `/metrics` endpoint. Help the user extend their monitoring coverage: for the selected machine, show which known agents/exporters are already reporting and suggest additional ones that could be set up, with a short description and a pointer to their setup documentation.

## Acceptance Criteria
- [ ] For the selected machine, the app lists the exporters/jobs currently reporting metrics (derived from Prometheus data such as `job`/`instance` labels or `up` series)
- [ ] The app suggests known exporters that are not yet reporting for that machine (e.g. Syncthing, node_exporter), each with a short description and a link to setup documentation
- [ ] A machine where every known exporter is already reporting displays a clear "full coverage" state instead of an empty suggestion list
- [ ] If the Prometheus queries used to compute coverage fail, a clear error message is shown

## Notes
Syncthing is the motivating example: it ships a native Prometheus-compatible `/metrics` REST endpoint. The catalog of known exporters can start as a small static list in the app (name, description, doc URL, detection rule such as a job name or a signature metric like `syncthing_*` / `node_*`). Open question for implementation: detection via the `up` series and `job` labels vs. signature metric names.
