Chart Compare – Feature Summary
==============================

CHART FEATURES
--------------
• Two chart panels side by side:
  - Resampled (precision 1.0) – resampling enabled for large datasets
  - No-loss (every point) – all points rendered, no resampling

• Data display:
  - Multiple series with name, color, thickness, optional dash
  - Zero axis lines (x=0, y=0)
  - Reference shapes (from sharedOptions):
    - Vertical line at x=250,000 (green)
    - Box "Target Region" (x: 100k–200k, y: -5k–5k)
    - Full-height band (x: 350k–450k)
  - Static icons (e.g. default point mark icon at 250000, 0)


INTERACTION FEATURES
--------------------
• Zoom & pan:
  - Left-click drag – rubber-band zoom
  - Mouse wheel – zoom in/out
  - Double-click – zoom to fit all data
  - Pan – Shift + drag (default)
  - Axis stretch – right-click drag to stretch/compress axes (or configurable modifier key)

• Zoom history:
  - Zoom back – toolbar button to restore previous zoom
  - Reset to basic zoom – toolbar button to fit all data (with zoom-back history)

• Bounds:
  - Clip zoom to data – zoom/pan cannot go outside data range (configurable)


POINT MARK (3-CLICK FLOW)
-------------------------
• Middle-click – place markers at x positions
• 3-click sequence – left, middle, right shoulder → vertical lines at each x
• Series picker modal (after 3 clicks):
  - Choose which series the middle point is bound to
  - Choose middle point color (red, green, yellow)
  - Done – saves 3 points and adds icon at middle point
  - Cancel – removes last click, keeps first two for retry
• Enter key – confirms selection when modal is open
• Validation – middle point must be between the two shoulders
• Output – JSON of 3 points logged to console; snackbar "Saved 3 points"


TOOLBAR BUTTONS (per chart)
---------------------------
| Button                  | Icon           | Action                    |
|-------------------------|----------------|---------------------------|
| Zoom back               | Undo           | Restore previous zoom     |
| Reset to basic zoom     | Logo           | Fit all data              |
| Disable all / Enable all| VisibilityOff  | Toggle all series on/off  |


LEGEND (GLOSSARY)
-----------------
• Series list – each series with line preview (color, dash, thickness)
• Per-series toggle – click to show/hide series
• Group toggle – when seriesGroupKeys are set, grouped series toggle together
• Visual state – dimmed + strikethrough when hidden


ROLLOVER (HOVER)
----------------
• Vertical rollover line – follows cursor
• Tooltip – series name, X, Y at cursor
• Styling – configurable stroke color and dash


THEMING
-------
• Chart theme – background, text, series colors, rollover style
• Point mark icon – custom SVG with {{color}} placeholder
• Zero line color – configurable


COMPONENTS SUMMARY
------------------
| Component           | Purpose                              |
|---------------------|--------------------------------------|
| ChartWrapper        | Wraps chart, header, toolbar         |
| ChartPanelHeader    | Title, note, toolbar                 |
| ChartToolbarButton  | Zoom back, reset, disable all        |
| PointMarkModalOverlay | Series picker modal                |
| PointMarkModalButton / PointMarkModalCancel | Done / Cancel          |
| LegendSync          | Legend with series/group toggles     |
| PointMarkersSync    | Renders icons at chart locations    |
| ZoomResetSync       | Connects reset button to zoom extents|
| SeriesVisibilitySync| Syncs legend toggles to series visibility |
