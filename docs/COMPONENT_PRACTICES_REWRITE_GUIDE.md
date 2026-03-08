# Component Practices Rewrite Guide (React + TS + MUI)

> **Related:** Complements [`.cursor/rules/component-architecture.mdc`](../.cursor/rules/component-architecture.mdc). Combines project-specific guidance with research from React docs, Kent C. Dodds, Martin Fowler, MUI docs, and industry articles (2024–2026).

## Quick reference

| Do | Don't |
|----|-------|
| Derive state in render; update from event handlers | Set state inside `useEffect` for sync normalization |
| Keep `*.tsx` files component-only | Export utilities/context from component files |
| Use stable refs for empty arrays/objects in memo deps | Pass `data ?? []` directly into `useMemo` deps |
| Single source of truth for visibility (React/store) | Mutate chart internals + `forceUpdate` |
| Import from specific files in feature code | Use barrel imports internally |
| Remove no-op abstractions | Keep context that duplicates store behavior |
| Split orchestration hooks into single-purpose hooks | Keep one large hook that mixes zoom, visibility, legend, header |
| Colocate state by default; lift only when needed | Over-lift state or use global store for local UI |
| Prefer local state in plug-and-play components (used in multiple pages/flows/features) | Couple shared components to global store |
| Use unified or easy-to-convert interfaces and types across layers (e.g. Chart → SciChartWrapper) | Duplicate or incompatible type definitions per layer |
| Use Context for infrequent, cross-cutting data | Use Context for frequent updates or when store exists |

## Table of contents

1. [Scope](#scope)
2. [What is already good](#what-is-already-good-in-your-project)
3. [Best practices](#best-practices)
4. [Bad practices / risks to avoid](#bad-practices--risks-to-avoid-with-refs)
5. [State and ref location](#state-and-ref-location)
6. [Recommended component structure](#recommended-component-structure)
7. [Import rules](#import-rules-practical)
8. [Context: when and why](#context-when-and-why-to-use-it)
9. [Library abstraction (adapter pattern)](#library-abstraction-adapter-pattern)
10. [Hooks usage guidelines](#hooks-usage-guidelines-for-this-project)
11. [Rule: Split orchestration hooks](#rule-split-orchestration-hooks-into-single-purpose-hooks)
12. [When to split components/hooks](#when-to-split-into-smaller-componentshooks)
13. [Plug-and-play design](#plug-and-play-design)
14. [Maintainability and readability](#maintainability-and-readability)
15. [MUI-specific practices](#mui-specific-practices)
16. [Concrete rewrite priorities](#concrete-rewrite-priorities-recommended-order)
17. [Reference files](#reference-files-reviewed)

---

## Scope

This guide covers:

- Component structure and imports
- State and ref location
- Bad practices to avoid
- Context usage (when and why)
- Library abstraction for chart switching
- Maintainability and readability
- Hooks usage and component splitting
- Plug-and-play design boundaries

---

## What is already good in your project

### 1. Generic facade vs implementation split (strong)

- `Chart.tsx` documents the facade responsibility in its header comment.
- `SciChartWrapper.tsx` keeps chart-library specifics in the implementation layer.
- `implementationProps.ts` defines a reusable implementation contract (`ChartImplementationProps`).

**Why this is good:** You already have the key prerequisite for swapping chart engines.

### 2. Library-agnostic domain types (strong)

- `src/chart/types.ts` defines generic types.
- Core types are implementation-free (`ChartData`, `ChartStyle`, `ChartOptions`).

**Why this is good:** Keeps app-level code independent of SciChart APIs.

### 3. Smart hook extraction from `Chart` (good)

- `useChart.ts` centralizes orchestration logic.
- `useChartWrapperStyle.ts` and `useChartWrapperOptions.ts` separate style/options normalization.

**Why this is good:** Keeps the render component (`Chart`) focused on layout and composition.

### 4. Overlay slot pattern for legend (good)

- `overlaySlot` contract in `implementationProps.ts` (lines 93–97).
- Used by `Chart` when rendering `SciChartWrapper` with `overlaySlot={legendSlot}`.

**Why this is good:** Reusable composition seam that is not hardwired to a specific UI element.

### 5. Store-backed domain workflow (good direction)

- `src/store/pointMarkStore.ts` captures point-mark workflow as state machine-like actions.

**Why this is good:** Complex interaction is not scattered across many unrelated components.

---

## Best practices

### Single responsibility

- Each component, hook, or module has **one clear responsibility**.
- Avoid "god components" that handle many unrelated concerns.
- Improves testability, maintainability, and composition.

### Feature-based organization

- Organize by **feature**, not by type (components/, hooks/, utils/).
- Benefits: easier feature removal, fewer circular deps, clearer boundaries.

### Component folder structure

Per-component layout:

```
ComponentName/
  ComponentName.tsx      # Main component
  ComponentName.types.ts # Types (or colocate)
  useComponentName.ts    # Logic hook
  ComponentName.test.tsx
  index.ts               # Public API only
```

### Keep components small and focused

- Break complex components into smaller, focused units.
- Prefer composition over large monolithic components.
- Use functional components with hooks (avoid class components).

---

## Bad practices / risks to avoid (with refs)

### High priority

#### 1. Effect-driven synchronous state updates

- `Detect.tsx` sets state inside `useEffect` (e.g. around lines 132–138).
- `useChartSeriesVisibility.ts` sets state inside `useEffect`.

**Why avoid:** Causes cascading renders and hook rule/lint violations (`react-hooks/set-state-in-effect`). Effects are for **synchronizing with external systems** (DOM, network, subscriptions). Derive values during render.

**Preferred pattern:**

```tsx
// ❌ BAD – effect syncs state
useEffect(() => {
  setDerivedValue(computeFromProps(props));
}, [props]);

// ✅ GOOD – derive in render
const derivedValue = useMemo(() => computeFromProps(props), [props]);

// ✅ GOOD – update from event handler
const handleChange = useCallback((value) => {
  setState(value);
  dispatchStoreAction(value);
}, []);
```

#### 2. Mixed React component + non-component exports in same file (Fast Refresh issue)

- `PointMarkClearContext.tsx` exports utility functions and context in the same module.
- `Chart.tsx` exports `useChartLegendSlot` (hook-like utility) from the component file.

**Why avoid:** Breaks Fast Refresh assumptions and increases accidental module coupling.

**Preferred pattern:** Keep `*.tsx` files exporting components only. Move helpers to separate `*.ts` modules.

#### 3. Unstable dependencies created outside memo hooks

- `Detect.tsx`: `confirmedShapes` (or similar) feeds `useMemo` deps.
- `useChart.ts` line 30: `chartData = data ?? []` creates a new array reference every render when `data` is null.

**Why avoid:** Triggers unnecessary recalculation and noisy exhaustive-deps warnings.

**Preferred pattern:**

```tsx
// ❌ BAD – new array every render
const chartData = data ?? [];
const result = useMemo(() => process(chartData), [chartData]);

// ✅ GOOD – stable empty array
const EMPTY_CHART_DATA: ChartData = [];
const chartData = data ?? EMPTY_CHART_DATA;
const result = useMemo(() => process(chartData), [chartData]);
```

### Medium priority

#### 4. No-op context that duplicates store intent

- `PointMarkClearContext.tsx`: functions are no-ops; real behavior is store-driven.

**Why avoid:** Adds mental overhead with no behavioral value.

#### 5. Hook doing direct imperative chart mutation + forced rerender

- `useLegend.ts` (lines 72–99): mutates SciChart series visibility and calls `forceUpdate`.

**Why avoid:** Hard to test and reason about; couples UI state to imperative chart internals.

**Preferred pattern:** Single source of truth for visibility (React/store); sync layer pushes state into chart surface.

#### 6. Barrel imports from broad module in feature code

- `Detect.tsx` imports from `./chart` barrel.

**Why avoid:** Circular dependencies when internals import from barrel; tree-shaking can bundle unused code.

**Preferred pattern:**

```tsx
// ❌ BAD – barrel
import { Chart, ChartData } from './chart';

// ✅ GOOD – direct
import { Chart } from './chart/Chart';
import type { ChartData } from './chart/types';
```

#### 7. Debug output in production flow

- `Detect.tsx`: `console.log(JSON.stringify(...))` in the main flow.

**Why avoid:** Noise and potential data leakage in production.

#### 8. Other anti-patterns (research-backed)

- **Unstable keys in lists** – Use stable IDs, not array indices when list can reorder.
- **Overusing state** – Prefer derived values, props, or refs where appropriate.
- **Direct DOM manipulation** – Let React manage DOM; use refs only when needed.
- **Monolithic context** – Split by concern; memoize values.
- **Inline context values** – Memoize: `value={useMemo(() => ({ foo, bar }), [foo, bar])}`.

---

## State and ref location

### Colocate state by default

- Keep state as close as possible to where it's used.
- Reduces re-renders and keeps components easier to reason about.

### When to use local state

- State used by one component or a small, tightly coupled group.
- UI-only state (open/closed, focus, form fields).
- No need to share across distant parts of the app.

### When to move to global state

- Same state needed in multiple distant parts of the app.
- Prop drilling through 3+ levels.
- You spend more time passing props than building features.

### Plug-and-play components: prefer local state

For components in `shared/` that are used across multiple pages, flows, and features: **prefer local state over global state**. Local state keeps the component portable—it can be dropped into any context without requiring a global store or coupling to project-specific state. The consumer (feature) can lift state or connect to a store when needed; the shared component stays independent.

### State management by use case

| Use case | Tool | Notes |
|----------|------|-------|
| Infrequent global data (theme, auth, locale) | Context | Memoize value; split by concern |
| Frequent or complex client state | Zustand, Redux Toolkit | Zustand: less boilerplate, selective subscriptions |
| Server state | React Query, SWR | Separate from client state |
| Form state | React Hook Form, Formik | Local to form when possible |

### Refs vs state

- **Refs:** Values that don't affect rendering (DOM nodes, timers, previous values).
- **State:** Values that affect rendering; changes trigger re-renders.
- Use refs for imperative handles, subscriptions, and values that shouldn't cause re-renders.

---

## Recommended component structure

| Layer | Purpose | Contents |
|-------|---------|----------|
| `domain/` | Pure logic, no React/MUI/SciChart | Point mark calculations, interpolation, validation, data contracts |
| `shared/` | **All plug-and-play components** | Chart (facade, hooks, types, defaults), chart implementation adapters, UI primitives (buttons, overlays, skeletons) |
| `shared/chart/` | Chart abstraction | `Chart` facade, implementation-agnostic hooks, types, defaults |
| `shared/chart/implementation/scichart/` | Adapter for SciChart | Adapter implementing `ChartImplementationProps`, conversion/sync hooks, all `scichart` imports |
| `features/detect/` | Project-specific behavior | Detection orchestration, modal UX, store integration |

**Import direction:** `features` → `shared` → `domain`. No upward imports.

---

## Import rules (practical)

1. **Enforce directional imports** – `features` → `shared` → `domain`. No upward imports. Adapters in `shared/` must not import feature modules.

2. **Avoid wide barrels internally** – Internal files use direct paths (`./chart/Chart`, `./chart/types`). `index.ts` barrels are only for public entry points.

3. **Keep type-only imports explicit** – Use `import type` for types.

4. **Group imports consistently** – Type-only → external libs → internal (alias/relative) → relative. See component-architecture rule.

5. **Path aliases** – Use aliases (`@/shared`, `@/features`) for cleaner imports.

---

## Context: when and why to use it

**Use Context when all are true:**

1. Data is cross-cutting across a subtree.
2. Prop drilling would be deep or noisy.
3. Update frequency is low/moderate, or split by selector contexts.

**Do not use Context when:**

1. State is local to one feature/component.
2. State is already in Zustand (single source should stay there).
3. Values change very frequently and re-rendering wide trees is expensive.

**Performance pitfalls:**

- Any context update re-renders all consumers.
- Mitigations: split by concern, memoize value, separate state from actions (e.g. `DispatchContext` vs `StateContext`).

**For this codebase:** `PointMarkClearContext` should likely be removed or converted to a real scoped service. Today it adds indirection with no logic.

---

## Library abstraction (adapter pattern)

### Goal

- Abstract third-party libraries behind a stable interface.
- Swap implementations without changing app code.
- Keep app logic library-agnostic.

### Pattern

1. **Define a contract** – Interface that describes what your app needs.
2. **Implement adapters** – Each adapter wraps a library and implements the contract.
3. **Inject implementation** – Use prop, provider, or factory to choose the adapter.

### Unified types and props

Use **unified or at least easy-to-convert interfaces and types** across layers. Chart and SciChartWrapper should share types and props where possible, or use thin conversion layers instead of divergent definitions.

**Example (Chart → SciChartWrapper):**

- `ChartData`, `ChartStyle`, `ChartOptions` = shared domain types.
- `ChartImplementationProps` = contract that extends or maps from those types.
- SciChartWrapper receives `ChartImplementationProps`; conversion to SciChart-specific types happens in one place (e.g. `convert.ts`).
- Avoid duplicate or incompatible type definitions per layer—prefer shared types, or explicit `ToSciChartX` converters with clear input/output types.

**Benefits:** Single source of truth for shapes; easier to add new implementations; fewer conversion bugs.

### For your chart

- `ChartImplementationProps` = contract.
- `SciChartWrapper` = SciChart adapter.
- Share `ChartData`, `ChartStyle`, and related types; convert only where the library requires it.
- Inject via prop/provider so `Chart` doesn't import `SciChartWrapper` directly.

### Runtime switching (optional)

```ts
const adapters = {
  scichart: () => createSciChartAdapter(),
  chartjs: () => createChartJsAdapter(),
};
const adapter = adapters[provider]();
```

---

## Hooks usage guidelines for this project

1. **Effects synchronize with external systems only** – Good: window listeners, SciChart surface sync. Avoid: effect-only state normalization (derive in render or update from handlers).

2. **Prefer `useMemo`/derived values over mirror state** – If a value can be computed from props/store each render, avoid separate state.

3. **Keep hooks single-purpose** – Split orchestration hooks into smaller hooks. See [Rule: Split orchestration hooks](#rule-split-orchestration-hooks-into-single-purpose-hooks).

4. **Stabilize callback/object identities** – Memoize array/object values that are deps of other memos; use `useCallback` for handlers passed as deps.

5. **Split when you feel pain** – Duplication is often cheaper than the wrong abstraction. Split when reusability, performance, or testing becomes a real problem.

---

## Rule: Split orchestration hooks into single-purpose hooks

When a hook combines multiple concerns (zoom, visibility, legend, header, style, options), split it into smaller hooks so that:

1. **Other components can reuse only what they need** – A headless `ChartSurface` needs zoom + style + options + visibility, not legend or header.
2. **Each hook has one clear responsibility** – Easier to understand, change, and test.
3. **Components stay structured** – The orchestrator composes the small hooks; consumers pick the subset they need.

### When to apply

Split when the hook handles more than one distinct concern, would be useful in subset form, or is hard to reason about or test.

### Preferred structure

| Hook | Responsibility | Used by |
|------|----------------|---------|
| `useChartZoomCallbacks` | Zoom back/reset refs, `canZoomBack`, setters | ChartSurface, Chart |
| `useChartSeriesVisibility` | Visibility state, handlers, `handleDisableAll`, `allSeriesHidden` | ChartSurface, Chart, Legend |
| `useChartWrapperStyle` | Style from theme/options (`textColor`, `chartOnly`) | ChartSurface, Chart |
| `useChartWrapperOptions` | Options + visibility handlers for implementation | ChartSurface, Chart |
| `useChartLegendProps` | Legend config (colors, visibility, callbacks) | Chart (when legend shown) |
| `useChartHeaderState` | `showHeader`, `headerSx`, loading | Chart (when header shown) |

### Composition pattern

```
useChart (orchestrator)
  ├── useChartZoomCallbacks
  ├── useChartSeriesVisibility
  ├── useChartWrapperStyle
  ├── useChartWrapperOptions
  ├── useChartLegendProps
  └── useChartHeaderState
```

- **ChartSurface (headless)** – Uses zoom + style + options + visibility. No legend or header.
- **Chart (full)** – Uses `useChart` and renders header + legend from `useChartHeaderState` and `useChartLegendProps`.

---

## When to split into smaller components/hooks

**Split when any is true:**

1. File exceeds one clear responsibility.
2. You need to scroll to understand unrelated concerns.
3. Component has more than one state machine.
4. JSX blocks represent independent UI units.
5. Logic needs isolated tests.
6. Hard to track which state belongs to which UI.
7. Reusability, performance, or collaboration becomes a problem.

**Apply now to `Detect.tsx`:**

- `DetectChartLayer` – prepares chart options/icons
- `SeriesPickerModal` – UI + keyboard handling
- `useDetectPointMarkFlow` – interaction orchestration

**Principle:** Split when you feel pain, not preemptively. Duplication is often cheaper than the wrong abstraction.

---

## Plug-and-play design

**Principle:** Chart should be plug-and-play; Detect is project-specific.

### Headless components

- Separate logic from presentation.
- Expose state, handlers, and behavior; consumer controls UI.
- Benefits: styling flexibility, design system integration, logic reuse.

### Making components portable

1. **Minimal, stable API** – Small surface area, sensible defaults.
2. **Composition over configuration** – Slots, children, render props.
3. **No project-specific imports** – No store, no feature modules.
4. **Library-agnostic core** – Adapters for implementations.
5. **Clear boundaries** – Features consume shared; shared does not depend on features.
6. **Prefer local state over global state** – So the component can be used in multiple pages, flows, and features without coupling to a store. The consumer lifts or connects to a store when needed.
7. **Unified or easy-to-convert types** – Share types and props across layers (e.g. Chart → SciChartWrapper). Use thin conversion layers instead of divergent definitions; see [Library abstraction](#library-abstraction-adapter-pattern).

### Chart vs Detect

| Component | Portable? | Reason |
|-----------|-----------|--------|
| Chart | Yes | Generic data/options/style; no project-specific logic |
| Detect | No | Point mark flow, modal, store; project-specific |

### Target abstraction model

1. Keep `Chart` public API stable and minimal.
2. Create adapter interface for implementations (`implementationProps.ts`).
3. Inject implementation via prop/provider/factory.
4. Keep feature workflows outside shared.
5. Isolate library conversion layer (`convert.ts`).

---

## Maintainability and readability

- **Single responsibility** – One reason to change per component, hook, or module.
- **Self-documenting code** – Meaningful names; avoid abbreviations.
- **DRY and YAGNI** – Don't repeat yourself; don't add features until needed.
- **Composition over inheritance** – Compose small, focused units.
- **Flatten structure** – Early returns; optional chaining.
- **Extract magic values** – Move to constants; colocate with feature.
- **Living documentation** – TypeScript interfaces as API docs; prop destructuring.

### Checklist

- [ ] One file = one main responsibility
- [ ] Split orchestration hooks into single-purpose hooks
- [ ] Move non-component exports out of component files
- [ ] Remove no-op abstractions
- [ ] Keep side effects explicit and isolated
- [ ] Prefer named utility functions over inline complex expressions
- [ ] Keep imports stable and ordered
- [ ] Add tests around domain logic (point-mark rules, interpolation)
- [ ] Add ESLint rules for boundaries and import order

---

## MUI-specific practices

### Use the theme

- Prefer `theme.spacing()`, `theme.palette`, `theme.typography`.
- Extend the theme for custom values instead of hardcoding.

### Customization hierarchy

1. **One-off:** `sx` prop.
2. **Reusable:** Custom component using `styled()`.
3. **Global:** Theme `components` overrides.
4. **Last resort:** Global CSS override.

### Themed components

- Use `styled()` with `name` and `slot` for theme compatibility.
- Allows customization via `theme.components.MuiCustom`.

### Extensible themes

- Branded theme: design tokens, component overrides.
- App theme: extends branded theme.
- Use array syntax for `components` when merging to preserve variants.

---

## Concrete rewrite priorities (recommended order)

### Quick wins (low effort, high impact)

1. **Remove debug `console.log`** in `Detect.tsx` – guard or delete.
2. **Fix import order** in `pointMarkStore.ts` – move imports to top.
3. **Stabilize `chartData`** in `useChart.ts` – use `EMPTY_CHART_DATA` constant instead of `data ?? []`.

### High priority (correctness)

4. **Fix hook correctness issues** (lint violations):
   - `Detect.tsx` effect state update pattern
   - `useChartSeriesVisibility.ts` effect state update pattern
   - Stabilize memo dependencies where flagged

5. **Remove or replace `PointMarkClearContext`** – choose either real behavior or direct store usage.

### Refactors (structure)

6. **Split `Detect.tsx`** into `DetectChartLayer`, `SeriesPickerModal`, `useDetectPointMarkFlow`.

7. **Split `useChart`** into single-purpose hooks (see [Rule: Split orchestration hooks](#rule-split-orchestration-hooks-into-single-purpose-hooks)).

8. **Move `useChartLegendSlot`** out of `Chart.tsx` into `hooks/useChartLegendSlot.ts`.

9. **Make chart implementation injectable** – decouple `Chart.tsx` from direct `SciChartWrapper` import.

### Infrastructure

10. **Add import/boundary lint rules** – import order, no internal barrel imports, layer boundaries.

11. **Add tests for point-mark domain rules** – middle-between-shoulders validation, visibility/bindable filtering, cancel/restore flow.

---

## Reference files reviewed

*Line numbers may drift as the codebase changes.*

| File | Purpose |
|------|---------|
| `src/chart/Chart.tsx` | Chart facade, legend slot |
| `src/chart/hooks/useChart.ts` | Orchestration, zoom, visibility |
| `src/chart/hooks/useChartSeriesVisibility.ts` | Series visibility state |
| `src/chart/hooks/useChartWrapperOptions.ts` | Options normalization |
| `src/chart/hooks/useChartWrapperStyle.ts` | Style normalization |
| `src/chart/types.ts` | Domain types |
| `src/chart/Legend/useLegend.ts` | Legend + SciChart sync |
| `src/chart/implementation/implementationProps.ts` | Implementation contract |
| `src/chart/implementation/scichart/SciChartWrapper.tsx` | SciChart adapter |
| `src/Detect.tsx` | Point mark flow, modal |
| `src/store/pointMarkStore.ts` | Point mark state |
| `src/PointMarkClearContext.tsx` | No-op context (candidate for removal) |
| `src/App.tsx` | App composition |
| `eslint.config.js` | Lint configuration |

---

## Sources

- React docs: You Might Not Need an Effect, Reusing Logic with Custom Hooks
- Kent C. Dodds: State Colocation, When to Break Up a Component
- Martin Fowler: Headless Component pattern
- MUI: Theming, Building Extensible Themes
- Industry: adapter pattern, barrel files, Context performance, React anti-patterns (2024–2026)
