# Project Conventions

## React Components

**Use arrow function syntax for all React components.**

- Use `const Name = () =>` or `const Name = (props) =>` instead of `function Name()`.
- Export as `export const Name = ...` when exporting components.
- See `.cursor/rules/arrow-function-components.mdc` for examples.

## Styling & UI

**Use MUI (Material-UI), MUI styled, and MUI icons for all UI work.**

- **MUI components** – Prefer `@mui/material` components (Box, Button, Typography, Dialog, etc.) over raw HTML elements.
- **MUI styled** – Use `import { styled } from '@mui/material/styles'` for custom styling. Place styled components in `src/styled/` and export from `src/styled/index.ts`.
- **MUI icons** – Use `@mui/icons-material` for icons (e.g. `VisibilityOffIcon`, `VisibilityIcon`).
- **No standalone CSS files** – Avoid adding new `.css` files. Use MUI `sx` prop, `styled()`, or theme overrides instead.
- **Theme** – Global MUI theme lives in `src/theme.ts`. Use `createAppTheme(overrides)` to customize. Use `ThemeProvider` and `CssBaseline` in the app root.
- **Chart theme** – Chart colors and styling live in `src/chartTheme.ts`. Wrap charts with `ChartThemeProvider` and pass `theme={{ ... }}` to customize. Use `createChartTheme(overrides)` for a theme object. Chart theme includes: `defaultSeriesColors`, `backgroundColor`, `rolloverStroke`, `rolloverDash`, `defaultStrokeThickness`, `pointMarkIcon`, `pointMarkIconColor`.

Apply these conventions to all new and modified UI code.
