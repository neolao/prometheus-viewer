---
date: 2026-07-23
status: accepted
---
# Use the `host` label, not `instance`, to identify a machine

**Context:** Implementing "Select a Prometheus machine" (backlog item 001), which specified fetching machine names via `GET {baseUrl}/api/v1/label/instance/values`. Running the feature against the real, connected Prometheus server showed `instance` holds `blackbox_http` probe target URLs (e.g. `https://cv.neolao.com/`), not machine/host names — the actual monitored host (`retrogaming`) is carried on the `host` label instead.

**Decision:** Fetch machine names via `GET {baseUrl}/api/v1/label/host/values` instead of `instance`.

**Reason:** The `host` label matches what a user means by "machine" in this app — a physical/virtual host being monitored — while `instance` on this server's scrape config identifies the probed target of a job, which for `blackbox_http` jobs is a URL, not a machine.

**Rejected alternatives:** Keep `instance` as originally specified in the backlog item — rejected because it lists probe target URLs instead of actual machines, defeating the purpose of the feature for this Prometheus setup.
