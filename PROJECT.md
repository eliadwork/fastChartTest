# Project Conventions

## Variable and Parameter Naming

**Use full, descriptive parameter and variable names. Avoid single-letter or overly abbreviated names.**

- Use `modifiers` not `m`
- Use `index` not `i`
- Use `store` not `s`
- Use `series` not `s` (when iterating series)
- Use `item` or the full noun (e.g. `shape`, `series`) not `s` or `x`

Apply this to all new and modified code.

## React Components

**Use arrow function syntax for all React components.**

```tsx
// ✅ GOOD
const MyComponent = ({ prop1, prop2 }: Props) => (
  <div>...</div>
)

export const ChartWrapper = (props: ChartWrapperProps) => {
  return <div>...</div>
}

// ❌ BAD
function MyComponent({ prop1, prop2 }: Props) {
  return <div>...</div>
}

export function ChartWrapper(props: ChartWrapperProps) {
  return <div>...</div>
}
```

- Use `const Name = () =>` or `const Name = (props) =>` instead of `function Name()`.
- Export as `export const Name = ...` when exporting components.

**Colocate component-specific props with their components.**

- Define `*Props` interfaces in the same file as the component that uses them.
- Keep shared types (e.g. `ChartData`, `ChartOptions`) in central type files; only component props live beside the component.

## Styling & UI

**Use MUI (Material-UI), MUI styled, and MUI icons for all UI work.**

- **MUI components** – Prefer `@mui/material` components (Box, Button, Typography, Dialog, etc.) over raw HTML elements.
- **MUI styled** – Use `import { styled } from '@mui/material/styles'` for custom styling. Place styled components in `src/styled/` and export from `src/styled/index.ts`.
- **MUI icons** – Use `@mui/icons-material` for icons (e.g. `VisibilityOffIcon`, `VisibilityIcon`).
- **No standalone CSS files** – Avoid adding new `.css` files. Use MUI `sx` prop, `styled()`, or theme overrides instead.
- **Theme** – Global MUI theme lives in `src/theme.ts`. Use `createAppTheme(overrides)` to customize. Use `ThemeProvider` and `CssBaseline` in the app root.
- **Chart theme** – Chart colors and styling live in `src/chartTheme.ts`. Wrap charts with `ChartThemeProvider` and pass `theme={{ ... }}` to customize. Use `createChartTheme(overrides)` for a theme object. Chart theme includes: `defaultSeriesColors`, `backgroundColor`, `rolloverStroke`, `rolloverDash`, `defaultStrokeThickness`, `pointMarkIcon`, `pointMarkIconColor`.

Apply these conventions to all new and modified UI code.

## Magic Numbers

**Avoid magic numbers.** Use named constants for numeric literals that convey meaning.

- Define constants at module or component scope with descriptive names.
- Prefer `const DEFAULT_PADDING = 8` over inline `8` when the value has semantic meaning.
- Group related constants together (e.g. animation durations, thresholds, limits).

## React Hooks

**Minimize the use of `useEffect`.** Prefer derived state, event handlers, or other patterns when possible.

- **Derived state** – Compute values from props/state during render instead of syncing in `useEffect`.
- **Event handlers** – React to user actions in handlers rather than effect-driven side effects.
- **Refs for subscriptions** – Use refs to hold values that don’t need to trigger re-renders.
- Reserve `useEffect` for true side effects (e.g. subscriptions, DOM measurement, imperative APIs) that cannot be expressed as render-time computation or event handling.
