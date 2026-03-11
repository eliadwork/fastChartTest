# Feature Layer Rules

This file governs all code under `src/features/**`.

---

# Critical Feature Invariants (MUST NEVER BE VIOLATED)

1. Features must interact with charts only through the chart facade.
2. TanStack Query owns server state.
3. Zustand owns shared client state only.
4. Query results must not be copied into Zustand as canonical state.
5. Draft edits must not replace the canonical query cache.
6. Feature contracts must stay aligned with backend DTOs at the API boundary.

---

# Feature Module Pattern

feature contract  
→ resolver  
→ helpers  
→ flow hooks  
→ query hooks  
→ mutation hooks  
→ UI components

Responsibilities:

- define feature-local contracts
- normalize feature options
- own feature behavior
- own feature-level query and mutation orchestration
- render feature UI

---

# Chart Boundary Rule

Features must never import:

src/chart/contracts/_
src/chart/helpers/_
src/chart/implementation/\*

Features interact with charts only through the chart facade.

---

# Query and Mutation Ownership (MUST)

Use TanStack Query for all server-state flows unless there is a documented reason not to.

## Query hooks

Query hooks must:

- own one query concern
- use stable typed query keys
- colocate by feature or API domain
- return typed query state

Rules:

- do not hide unrelated mutations inside query hooks
- do not mix unrelated queries inside a single hook

## Mutation hooks

Mutation hooks must:

- own one mutation concern
- define explicit cache follow-up behavior

Rules:

- use targeted invalidation, `setQueryData`, or optimistic updates when appropriate
- do not mix unrelated mutations into one hook

---

# Server-State Ownership (MUST)

TanStack Query owns:

- API reads
- API writes
- cache state
- background refetching
- stale/fresh lifecycle

Do not:

- copy query results into Zustand just for convenience
- mirror query results into local state unless creating a separate editable draft
- implement fetch flows using `useEffect` when they belong in query hooks

---

# Drafting Pattern (MUST)

When editing server-managed data:

Do **not** copy TanStack Query results into Zustand as a second source of truth.

Use this pattern:

1. TanStack Query provides the canonical server state.
2. Local `useState` or a temporary Zustand store holds unsaved draft edits.
3. On Save → send the draft through a mutation.
4. On Cancel → discard the draft and fall back to the query cache.

Zustand may be used for drafts only when the draft must be shared across multiple components or steps.

Do not use Zustand as a duplicate server cache.

---

# Zustand Rules

Use Zustand for:

- shared client UI state
- persistent user preferences
- cross-feature UI coordination

Always use focused selectors.

Bad:

```ts
const { width, height } = useChartStore()

Good:

const width = useChartStore((s) => s.width)
const height = useChartStore((s) => s.height)

Rules:

components must subscribe only to the fields they use

do not expose entire stores to components

avoid unnecessary re-renders

Contract Drift Rule (MUST)

When a backend request or response DTO changes, review the corresponding frontend contract.

Rules:

keep shared payload fields aligned in name and type

if shapes intentionally differ, add an explicit mapper

do not allow silent drift between backend DTOs and frontend feature/query contracts

Resolver Rules

Feature defaults belong in resolvers, not components.

Rules:

do not implement feature defaults in UI

do not use ?? or || in components to enforce feature defaults

normalize once in the resolver

preserve explicit user values

Hook Rules
Flow hooks

Flow hooks coordinate feature behavior.

Responsibilities:

compose model/query/mutation/facade interactions

orchestrate actions

expose feature APIs for UI components

Rules:

do not embed unrelated helper logic inline

do not mix unrelated concerns inside a single flow hook

Strict Context Rule

When feature hooks/components depend on context:

- use a strict custom hook instead of direct `useContext`
- context created in this repo must default to `undefined`
- strict hook must throw when provider is missing
- do not use fake defaults

Provider placement:

- scope provider to the lowest subtree that needs it
- avoid page-level providers for instance-local state
- multiple instances on the same page must work independently unless shared state is intentional

Ghost Effects Rule

Avoid unnecessary useEffect.

Do not use useEffect when the action belongs in:

event handlers

mutation callbacks

Zustand store actions

flow hook orchestration

Prefer explicit action flows over trigger-based effects.

API Symmetry Expectations

Create and update endpoints should return full resource objects.

Reasons:

enables TanStack Query cache updates

avoids mandatory refetches

keeps UI state consistent

If the backend returns incomplete responses, treat it as a contract issue and update the API or add a mapping strategy.

Feature Option Structure

New feature configuration must live under:

options.features

Rules:

do not introduce new top-level feature configuration fields

existing legacy options may remain during migration but must not expand further

Testing Expectations

For non-trivial feature hooks or components, include tests covering:

one happy path

one edge case

one mutation/query cache update scenario when relevant


If you want, I can also print the **`backend/AGENTS.md`**, which is the last file in
```
