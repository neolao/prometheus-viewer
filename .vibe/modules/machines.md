# Module: machines

**Role:** Lets the user pick which Prometheus machine (`host` label value) to work on, with loading, empty and error states. Gates the metrics view — rendered by `app` before it shows `metrics`.
**Files:** `src/features/machines/MachineSelector.tsx`
**Exports:** `MachineSelector({ baseUrl: string, onSelect: (machine: string) => void })` — React component; re-fetches whenever `baseUrl` changes, calls `onSelect` when the user picks a machine.
**Depends on:** [`modules/api-prometheus.md`](api-prometheus.md)
