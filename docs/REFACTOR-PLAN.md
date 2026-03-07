# Chart Refactor Plan – Definitions First, Then Execution

**Execute Phase 0 (documentation) before any code changes.** These definitions guide the refactoring.

The definitions have been added to:
- [PROJECT.md](../PROJECT.md) – Chart folder structure, props placement, component definitions
- [CR_PROMPT.md](../CR_PROMPT.md) – Architecture table
- [.cursor/rules/colocate-component-props.mdc](../.cursor/rules/colocate-component-props.mdc) – Props at top

---

## Phase 0: Documentation (Execute First)

### 0.1 PROJECT.md – Add Chart Architecture Section

Add to `PROJECT.md`:

```markdown
## Chart Folder Structure

**Single chart folder.** All chart code lives under `src/chart/`. SciChart implementation lives under `implementation/scichart/`.

chart/
├── Chart.tsx               (facade – header, legend slot, delegates to SciChartWrapper)
├── ChartStyled.ts
├── Legend/                 (injected via overlaySlot – lives at chart level)
├── implementation/
│   └── scichart/           (SciChart implementation – SciChartWrapper, convert, modifiers, SciChart hooks)
├── hooks/                  (chart-level hooks: useChartSeriesVisibility, useChartWrapperStyle, useChartWrapperOptions)
├── types.ts
├── chartTypes.ts
├── chartConstants.ts
├── chartWrapperInterface.ts
├── defaults.ts
└── index.ts

- **Legend** – Lives at `chart/Legend/` because it is injected from outside via `overlaySlot`. Parent (Chart) provides it; SciChartWrapper only renders the slot.
- **SciChartWrapper** – Lives at `chart/implementation/scichart/`. Receives `overlaySlot` (e.g. Legend) from parent. No header, legend, or buttons; parent manages UI state.
- **Chart hooks** – In `chart/hooks/`. SciChart-specific hooks (useSciChartMergedOptions, useZoomResetSync, etc.) live in `chart/implementation/scichart/hooks/`.

## Props Interface Placement

**For each component, place the props interface at the top of the file (same page as the component).**

Components: Legend, SciChartWrapper, Chart, SciChartSurfaceRenderer.

// GOOD – interface at top, same file
export interface LegendProps {
  backgroundColor?: string
  textColor?: string
  seriesVisibility?: boolean[]
}

const Legend = ({ backgroundColor, ... }: LegendProps) => { ... }

## Chart Component Definitions

| Component | Location | Role |
|-----------|----------|------|
| Chart | chart/Chart.tsx | Generic facade. Owns header, legend slot, series visibility. Delegates to SciChartWrapper. No SciChart imports. |
| Legend | chart/Legend/Legend.tsx | Injected via overlaySlot. Renders series list with toggle. Uses SciChartSurfaceContext. |
| SciChartWrapper | chart/implementation/scichart/SciChartWrapper.tsx | SciChart implementation. Receives overlaySlot from parent. No header/legend. |
| SciChartSurfaceRenderer | chart/implementation/scichart/SciChartSurfaceRenderer.tsx | Renders SciChart surface, axes, series, modifiers. Receives ConvertedData. |
```

### 0.2 Update Other MDs

- **CR_PROMPT.md** – Update architecture table: single chart folder, Legend at chart/Legend.
- **.cursor/rules/colocate-component-props.mdc** – Add: "Place *Props interface at the top of the file, same page as the component."

---

## Phase 1: Folder Structure (Single Chart Folder)

**One chart folder.** SciChart implementation under `chart/implementation/scichart/`.

**Structure:**
- `chart/Chart.tsx` – Generic facade (no Chart/ subfolder)
- `chart/Legend/` – Injected via overlaySlot
- `chart/implementation/scichart/` – SciChartWrapper, convert, modifiers, SciChart-specific hooks
- `chart/hooks/` – Chart-level hooks (useChartSeriesVisibility, useChartWrapperStyle, useChartWrapperOptions)

---

## Phase 2: Props Interface at Top

For each file, ensure the props interface is at the top (after file comment, before imports or right after):

- `chart/Legend/Legend.tsx` – LegendProps at top
- `chart/implementation/scichart/SciChartWrapper.tsx` – SciChartWrapperProps at top
- `chart/Chart.tsx` – ChartProps at top
- `chart/implementation/scichart/SciChartSurfaceRenderer.tsx` – SciChartSurfaceRendererProps at top

---

## Phase 3: Move Data Conversions to SciChart

Conversion lives in `chart/implementation/scichart/convert.ts`. Chart passes raw ChartData; conversion happens in SciChart layer.

---

## Phase 4: Code-Split, Skeleton, ChartWrapper Interface

- Create `chartWrapperInterface.ts` with generic types
- Create `SkeletonLoading` in shared
- Lazy-load ChartBody
- Add overlaySlot JSDoc to SciChartWrapper

---

## Execution Order

1. **Phase 0** – Update PROJECT.md, CR_PROMPT.md, colocate-component-props.mdc
2. **Phase 1** – Flatten folder structure
3. **Phase 2** – Props at top
4. **Phase 3** – Move conversions
5. **Phase 4** – Code-split, Skeleton, interface
