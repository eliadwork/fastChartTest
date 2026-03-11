# Chart Architecture Rules

This file governs all code under `src/chart/**`.

---

# Critical Chart Invariants (MUST NEVER BE VIOLATED)

1. The generic chart layer must remain library-agnostic.
2. SciChart code may exist only in `src/chart/implementation/scichart/**`.
3. Generic chart modules must never import implementation modules.
4. Feature modules must never bypass the chart facade.
5. Adapters must remain pure mappings.
6. Resolver functions must own all defaulting and normalization.
7. Runtime resources must be cleaned up when allocated.

---

# Generic vs Implementation Boundary

The generic chart layer includes:

`src/chart/**`

except:

`src/chart/implementation/scichart/**`

Rules:

- never import `scichart` in the generic chart layer
- never expose SciChart types in generic chart contracts
- never shape generic contracts directly for SciChart in generic files

SciChart-specific logic belongs only in:

- adapters
- implementation sync hooks
- implementation wiring modules

---

# Import Direction Rules

Allowed direction:

- implementation → chart facade
- chart facade → shared

Forbidden:

- generic chart → implementation
- generic chart → SciChart packages
- implementation leakage into feature contracts

---

# Chart Module Patterns

## Generic chart module pattern

contracts/types  
→ resolver  
→ helpers  
→ hook/component facade

Responsibilities:

- define library-agnostic contracts
- normalize chart configuration
- expose reusable pure helpers
- expose generic hooks/components

## SciChart implementation pattern

generic contract  
→ adapter  
→ runtime sync  
→ implementation wiring

Responsibilities:

- map contracts to SciChart structures
- manage runtime lifecycle
- own implementation-only helpers

---

# Contract-First Rules

Group related configuration props into typed contracts.

Bad:

```ts
dashPattern
dashGap

Good:

dash: DashConfig

Do not bypass typed contracts with scattered ad hoc fields.

Resolver Rules (MUST)

All defaults and normalization must happen in resolvers.

Rules:

accept raw user input

apply defaults only when the value is undefined

preserve explicit user values

return normalized contracts

Resolver precedence:

user value
→ feature defaults
→ global defaults

Hooks and components must consume normalized configuration only.

Adapter Rules (MUST)

Adapters translate generic contracts into implementation structures.

Adapters must:

be pure

have no side effects

contain no React state

not mutate input

not depend on runtime state

Naming convention:

map[GenericName]To[ImplementationName]

Examples:

mapSeriesConfigToSciChart
mapAxisOptionsToSciChart
mapAnnotationConfigToSciChart
No Transparent Prop Spreading

Do not pass configuration across chart boundaries using {...props}.

Bad:

<Series {...seriesConfig} />

Good:

mapSeriesConfigToSciChart(seriesConfig)
Hook Taxonomy
Model hooks

Pure state modeling only.

Return shape:

{ state, derived, actions }

Rules:

no runtime side effects

no SciChart imports

no implementation wiring

Sync hooks

Runtime synchronization only.

Rules:

consume normalized inputs

synchronize one concern

perform runtime binding/unbinding

clean up resources when allocated

Flow hooks

Compose hooks and coordinate behavior.

Rules:

orchestration only

compose model and sync hooks

do not embed unrelated helper logic inline

Lifecycle Cleanup Rule (MUST)

Implementation-layer effects and sync hooks must clean up resources when they allocate them.

Resources include:

SciChartSurface

chart modifiers

event listeners

subscriptions

Examples of required cleanup:

surface.delete()
modifier.delete()
subscription.unsubscribe()

If a hook allocates no resources, cleanup is not required.

Async Safety Rule (MUST)

Implementation hooks must assume SciChartSurface may be undefined during initialization or teardown.

Rules:

use optional chaining when accessing runtime objects

return early when runtime objects are not available

never use non-null assertions (!) on SciChart runtime objects

State Ownership Rules

Never mirror props into local state.

Allowed exception:

uncontrolled initial values only

Derived values must be computed using helpers or memoization.

Never store derived values in state.

Visual & Behavioral Constant Rule (MUST)

Extract visual or behavioral configuration values into named constants.

Must extract:

opacity values

stroke thickness

padding

spacing

animation durations

debounce timings

z-index

labels and UI strings

Allowed inline:

loop indices (i = 0)

arithmetic increments (x + 1)

array indexing

Bad:

const ZERO = 0

Good:

const HIDDEN_OPACITY = 0
Styling Rules

Prefer styled() for reusable styling.

Use sx for local adjustments.

Inline style={{}} should generally be avoided but may be used when:

runtime measurements are required

dynamic dimensions cannot be expressed through theme tokens

third-party integrations require inline styles

Change Scope Rule

Do not introduce unrelated chart refactors while implementing a task.

Rules:

modify the smallest number of files necessary

preserve existing module boundaries

Tier-2 architecture rules override minimal diffing

If a change introduces a second responsibility into a module, split the module instead of expanding it.
```
