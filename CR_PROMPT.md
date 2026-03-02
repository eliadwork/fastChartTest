# Code Review Prompt: Zoom/Pan Clip-to-Data Feature

Copy everything below the line into Claude (or another AI) to perform a code review.

---

## Your Task

Perform a **code review** of the recent changes that add "clip zoom/pan to data bounds" to a chart component. **If you find bugs, edge-case gaps, or architectural violations, fix them.** Do not refactor for style alone. Focus on: correctness, edge cases, API design, and adherence to the project's architecture.

---

## Project Conventions

See **PROJECT.md** for styling and UI conventions: use MUI, MUI styled, and MUI icons; avoid standalone CSS files.

---

## Project Architecture (CRITICAL – Do Not Violate)

The chart is split into **generic** and **implementation-specific** layers:

| Layer | Path | Rule |
|-------|------|------|
| **Generic** | `src/chart/types.ts`, `src/chart/Chart.tsx`, `src/chart/convert.ts` | No SciChart or other chart-library imports. Library-agnostic types and API only. |
| **Implementation** | `src/chart/impl/*.tsx`, `src/chart/impl/*.ts` | SciChart-specific code lives here. Imports from `scichart`. |
| **App wrapper** | `src/ChartWrapper.tsx` | Merges defaults and passes options to `Chart`. |

- `Chart` receives `ChartData` + `ChartOptions`, converts via `convertData()`, and renders `SciChartChart`.
- `ConvertedData` has `x: Float64Array` and `ys: Float64Array[]`.
- New options must be declared in `ChartOptions` (types.ts) and implemented only in `SciChartChart.tsx`.

---

## What Was Implemented

**Feature:** Zoom and pan are constrained so the user cannot zoom/pan outside the data range.

**Mechanism:** SciChart's `visibleRangeLimit` on `NumericAxis` restricts the visible range. When `clipZoomToData` is true (default), we compute min/max from the data and set `visibleRangeLimit` on both x and y axes.

---

## Files Changed

1. **`src/chart/types.ts`** – Added to `ChartOptions`:
   ```ts
   /** When true, zoom/pan cannot go outside the data bounds. Default: true */
   clipZoomToData?: boolean
   ```

2. **`src/chart/impl/SciChartChart.tsx`** – Implementation:
   - Import `NumberRange` from scichart
   - After creating x/y axes, if `clipZoomToData !== false` and data exists:
     - Compute `xMin`, `xMax` from `data.x`
     - Compute `yMin`, `yMax` across all `data.ys` (only finite values)
     - Set `xAxis.visibleRangeLimit` and `yAxis.visibleRangeLimit` using `NumberRange`
     - Use a small padding for single-point data (min === max) via `pad(n)` helper

3. **`src/ChartWrapper.tsx`** – Added `clipZoomToData: true` to `DEFAULT_OPTIONS`

---

## Review Checklist

Please check:

1. **Correctness**
   - Are x/y bounds computed correctly for `Float64Array` data?
   - Does `Math.min(...data.x)` / `Math.max(...data.x)` handle large arrays (spread can hit call stack limits)?
   - Is NaN/Infinity handling correct for y values?

2. **Edge cases**
   - Empty `data.x` or `data.ys` – is the guard `data.x.length > 0 && data.ys.length > 0` sufficient?
   - All-NaN y series – does `yMin`/`yMax` stay `Infinity`/`-Infinity` and is that handled?
   - Single point (xMin === xMax, yMin === yMax) – is the padding logic correct?

3. **API design**
   - Is `clipZoomToData?: boolean` with default `true` a good choice?
   - Should the option live in `ChartOptions` or elsewhere?

4. **Architecture**
   - Is all SciChart-specific logic (e.g. `NumberRange`, `visibleRangeLimit`) confined to `SciChartChart.tsx`?
   - Are `types.ts` and `convert.ts` still library-agnostic?

5. **Performance**
   - Any concern with iterating all y values for large datasets?

---

## Constraints for Your Fixes

- **Do not** move logic from `impl/` into `types.ts` or `convert.ts`.
- **Do not** add SciChart imports to the generic layer.
- **Do not** change the overall structure of `Chart`, `ChartWrapper`, or `SciChartChart`.
- Keep fixes minimal and localized to the relevant file(s).
- Fix real issues; skip purely stylistic changes.

---

## Output Format

1. **Summary** – One paragraph on overall quality and what you fixed (if anything).
2. **Issues found & fixed** – List each bug/edge case you addressed, with file + brief description.
3. **Changes made** – Apply the fixes directly to the code. Show the edits.
4. **Verdict** – Approve (no fixes needed) / Fixed (issues addressed) / Blocked (could not fix, explain why).
