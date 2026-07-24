---
date: 2026-07-24
status: accepted
---
# Use unified Pointer Events for chart hover/zoom, with a responsive-width SVG

**Context:** Backlog item 007 adds hover tooltips, drag-to-zoom, and a legend to the metric evolution chart (item 006), and the product owner explicitly required this to work on mobile. The chart is a hand-rolled inline SVG (no charting library, see `decisions/007`), previously rendered at a fixed 600x200 pixel size.

**Decision:**
- Handle hover, tap, and drag-to-zoom through a single Pointer Events state machine (`onPointerDown`/`onPointerMove`/`onPointerUp`, with `setPointerCapture` while dragging and `touch-action: none` on the interactive layer) instead of separate mouse and touch handlers.
  - Continuous `pointermove` without an active press drives the tooltip on mouse hover.
  - A press that moves past a small pixel threshold is a drag: it draws the zoom selection overlay and, on release, refetches the range.
  - A press that stays under the threshold is a tap/click: it pins the tooltip at that position — the only way to see values on touch, which has no hover concept.
- Change the chart's SVG from a fixed pixel `width`/`height` to `width="100%"` with the `viewBox` defining the coordinate system, so it fits narrow (mobile) viewports without forcing horizontal scroll. Pointer-to-data-coordinate mapping already goes through `getBoundingClientRect()`, so this does not change any conversion math.

**Reason:** Pointer Events fire for mouse, touch, and pen alike, so one code path covers desktop hover and mobile tap/drag without duplicated branching or missed gestures. Pointer capture keeps a touch-drag receiving events even if the finger moves outside the element's bounds, avoiding a stuck/half-finished zoom.

**Rejected alternatives:**
- Separate `mouse*`/`touch*` event handlers — duplicates the drag/threshold/state logic twice and is easy to let drift out of sync.
- Leaving touch unsupported (mouse/hover only) — rejected because mobile support was explicitly required for this feature.
- A full responsive visual redesign of the chart (typography, colors, breakpoints) — out of scope here; tracked separately by backlog item 011. This decision only makes the chart's own sizing adapt so the new interactions are usable on a phone screen.
