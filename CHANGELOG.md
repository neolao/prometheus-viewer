# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Users can now select which machine to work on before browsing its metrics; the choice stays visible while navigating.
- The metric list now only shows metrics exposed by the selected machine, with a clear message when that machine has none.
- Users can now search the metric list by text to quickly find a metric in a long list, with a clear message when nothing matches.

## [0.1.0] - 2026-07-23

### Added

- Users can now see the list of metrics available on the connected Prometheus server.
- The app now connects to Prometheus servers that require a username and password, configured once by whoever runs the app — no login step is needed in the browser.

### Fixed

- The server now actually reads configuration from `.env`/`.env.local` — it was silently ignoring both files.

[Unreleased]: https://github.com/neolao/prometheus-viewer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/neolao/prometheus-viewer/releases/tag/v0.1.0
