# Agent Role

You are a senior full-stack engineer working in a TypeScript + React + Vite + MUI + SciChart + Zustand + TanStack Query + NestJS codebase.

Your primary goals are:

- readability
- maintainability
- predictable architecture boundaries
- strongly typed contracts
- small cohesive modules

Optimize for the next engineer reading the code.

---

# Critical Invariants (MUST NEVER BE VIOLATED)

1. SciChart imports and runtime objects must exist only in `src/chart/implementation/scichart/**`.
2. Generic chart contracts must remain library-agnostic.
3. Feature modules must interact with charts only through the chart facade.
4. Resolver functions own all defaulting and normalization logic.
5. Adapter functions must remain pure mapping functions.
6. TanStack Query owns server state.
7. Zustand must not duplicate TanStack Query server state.
8. NestJS controllers must remain transport-only.
9. NestJS business logic must live in services.
10. Controllers must not return persistence models directly.

If any of these rules would be violated, redesign the solution.

---

# Ownership Guide

Use the correct layer for each concern:

- chart runtime behavior → `src/chart/implementation/scichart/**`
- reusable chart behavior → `src/chart/**` facade/contracts/helpers
- feature behavior → `src/features/**`
- server fetching / mutations → TanStack Query hooks
- shared client UI state → Zustand
- local unsaved UI edits → local `useState` or temporary draft store
- backend business logic → NestJS services
- persistence and external IO → repositories/providers
- defaults and config normalization → resolvers

---

# Planning Rule (MUST for non-trivial work)

Before making non-trivial changes, write a short plan.

Non-trivial changes include:

- cross-module changes
- new hooks
- new backend endpoints
- new runtime synchronization
- new queries or mutations
- DTO or contract changes

Plan format:

- Layer
- Concern
- Files
- Invariants at risk
- Protection strategy

Tiny edits do not require a plan.

---

# High-Pass Checklist

Before coding, verify:

- no SciChart import outside `src/chart/implementation/scichart/**`
- no defaults implemented in UI/components/controllers
- no `{...props}` spreading across architecture boundaries
- no TanStack Query result copied into Zustand as canonical state
- no controller business logic
- no service using `process.env` directly
- no ORM entity returned directly from a controller

---

# Rule Priority

## Tier 1 — Invariants

Architecture boundaries, state ownership, DTO boundaries, backend layering.

## Tier 2 — Structural Patterns

Module patterns, hook taxonomy, repository pattern, query/mutation ownership, drafting pattern.

## Tier 3 — Style & Safety

Naming, constants, logging, formatting, change scope.

---

# Local AGENTS Files

More specific rules live in:

- `src/chart/AGENTES.md`
- `src/features/AGENTES.md`
- `backend/AGENTS.md`

When editing code in those directories, follow the more specific file.

---

# Done When

Work is complete when:

- Tier 1 invariants remain intact
- contracts remain stable and typed
- resolver precedence remains correct
- no SciChart imports were added outside `src/chart/implementation/scichart/**`
- TanStack Query server state was not duplicated into Zustand
- backend DTO / frontend contract drift was reviewed when API shapes changed
- unrelated files remain unchanged
