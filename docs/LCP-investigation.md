# LCP Investigation – 11.76s Poor Score

**LCP element:** `h6.MuiTypography-root.MuiTypography-subtitle1` (ChartPanelTitle – e.g. "Resampled (precision 1.0)")

## Root Cause: Code / Bundle Structure (Not Just Slow PC)

The slow LCP is mainly due to how the app is loaded and rendered, not only hardware.

### 1. Large Monolithic Bundle (~2.9 MB)

- Main chunk includes **SciChart** and all chart code.
- No code splitting: App, Chart, SciChartWrapper, SciChart, MUI, etc. load together.
- **Impact:** Download + parse + execute of ~2.9 MB JS blocks the main thread before React can render.
- On slower networks/CPUs this can easily reach 10+ seconds.

### 2. Critical Path to First Paint

```
HTML loads → main.tsx → theme → App → Chart → SciChartWrapper → scichart
                                                      ↓
                                            (2.9 MB parsed & executed)
                                                      ↓
                                            React first render
                                                      ↓
                                            Browser paint (LCP = title)
```

The title (LCP element) only appears after:

1. Full JS bundle is parsed and executed
2. React runs the first render
3. Browser paints

So the title is delayed by the entire bundle, not by the chart itself.

### 3. Data Worker Is Not the Blocker

- Data is generated in a **Web Worker** (500k points × 10 lines).
- Worker runs in parallel; it does not block the main thread.
- When `data == null`, the app shows a loading spinner; the header (with title) is still rendered.
- LCP is slow because the main thread is busy with JS, not because it waits for the worker.

### 4. Theme Import Chain

- `theme.ts` imports `CHART_LEGEND_THEME_DEFAULTS` from `chart/scichart/components/Legend`.
- This pulls chart-related code into the initial load.
- Minor impact compared to SciChart, but it adds to the initial bundle.

### 5. Dev vs Prod

- **Dev (`npm run dev`):** Unminified bundle, source maps, HMR → much slower.
- **Prod (`npm run build` + `npm run preview`):** Minified, tree-shaken → faster.
- LCP should be measured in production mode for realistic numbers.

---

## Recommendations

### High Impact

1. **Code-split the chart**
   - Use `React.lazy()` for `Chart` or `SciChartWrapper`.
   - Render a minimal shell (layout, titles) first.
   - Load the chart module after the shell is painted.

2. **Lazy load SciChart**
   - Keep SciChart out of the initial bundle.
   - Load it only when the chart area is about to be shown.

### Medium Impact

3. **Reduce data worker cost**
   - Consider fewer points for the initial view (e.g. 50k instead of 500k).
   - Or stream/progressively load data.

4. **Preload critical assets**
   - Add `<link rel="modulepreload">` for the main entry.
   - Ensure WASM is only loaded when the chart is needed.

### Low Impact

5. **Decouple theme from chart**
   - Move `CHART_LEGEND_THEME_DEFAULTS` into `theme.ts` or a shared constants file.
   - Avoid importing from chart modules in the theme.

---

## Quick Test: Is It the Bundle?

1. Run **production** build: `npm run build && npm run preview`
2. Measure LCP again (e.g. Lighthouse or Chrome DevTools).
3. If LCP improves a lot (e.g. &lt; 3s), the main issue is bundle size and execution time.
4. If LCP stays high, investigate network, CPU, or other bottlenecks.

---

## Summary

| Factor              | Impact on LCP | Fixable? |
|---------------------|---------------|----------|
| 2.9 MB monolithic bundle | High          | Yes – code splitting |
| SciChart in main chunk   | High          | Yes – lazy load      |
| Data worker (500k pts)   | Low           | Minor – reduce points |
| Theme → chart import     | Low           | Yes – decouple       |
| Dev mode measurement     | Misleading    | Measure in prod      |

**Conclusion:** The 11.76 s LCP is primarily a **code/bundle structure issue**. Code-splitting and lazy-loading the chart should significantly improve LCP, especially on slower devices.
