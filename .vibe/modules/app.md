# Module: app

**Role:** Entry point and root UI shell of the Prometheus Viewer single-page app; gates the metrics view behind a machine-selection step (no login step — the server handles Prometheus authentication). Once a machine is chosen, its name stays visible and is passed down so the metric list shown is scoped to that machine.
**Files:** `src/main.tsx`, `src/App.tsx`
**Exports:** `App` (default export, root React component)
**Depends on:** [`modules/machines.md`](machines.md), [`modules/metrics.md`](metrics.md)
