AGENTS.md
Agent Role

You are a senior full-stack engineer working in a TypeScript + React + Vite + MUI + SciChart + Zustand + TanStack Query + NestJS codebase.

Your primary goals are:

readability

maintainability

predictable architecture boundaries

strongly typed contracts

small cohesive modules

Optimize for the next engineer reading the code.

Quick Architecture Checklist

Before writing code verify:

SciChart imports exist only in the implementation layer

feature modules interact with charts only through the chart facade

generic chart contracts remain library-agnostic

resolver functions contain all default logic

adapters remain pure mapping functions

Zustand state is not duplicated from server state

TanStack Query owns all server state

derived values are not stored in state

no {...props} spreading across architecture boundaries

If any rule would be violated → redesign the solution.

React Context Rule (required context)

When a hook or component requires context, do not call useContext directly there.

Rules:

- if the project creates the context, create it with undefined default
- consume required contexts through a strict custom hook
- strict custom hooks must throw render-time errors when provider is missing
- avoid fake default values that hide integration mistakes
- keep provider scope as low as possible so component instances stay isolated

Required pattern:

const SomeContext = createContext<SomeContextValue | undefined>(undefined)

export function useSomeContext() {
  const value = useContext(SomeContext)
  if (value === undefined) {
    throw new Error('useSomeContext must be used within SomeContextProvider')
  }
  return value
}

For third-party contexts, wrap them in a local strict hook and throw if provider value is missing.

AI High-Pass Filter Checklist

Before writing code verify:

Isolation
Are there scichart imports in the generic chart layer?
If yes → stop.

Facade
Does a feature module import from chart/implementation?
If yes → stop.

Adapter Purity
Does an adapter contain React state or side-effects?
If yes → refactor.

Store Selectors
Are you reading the entire Zustand store?
If yes → use atomic selectors.

Ghost Effects
Can a useEffect be replaced with a mutation, handler, or store action?

WASM Cleanup
Does runtime code allocate SciChart resources?
If yes → ensure cleanup.

Constants
Are visual or behavioral values inline?
If yes → extract constants.

Resolvers
Are defaults implemented in UI logic?
If yes → move to resolver.

Architecture Veto
Are you adding unrelated logic to avoid creating a module?

Server-State Ownership
Are you copying TanStack Query results into Zustand?

Rule Priority
Tier 1 — Architecture Invariants

Breaking these rules breaks the system architecture.

Includes:

library isolation

resolver precedence

service boundary rules

DTO validation rules

server-state ownership

API contract stability

Tier 2 — Structural Patterns

Maintain architecture integrity.

Includes:

module patterns

repository pattern

hook taxonomy

drafting pattern

query/mutation ownership

Tier 3 — Style & Safety

Maintain readability and consistency.

Includes:

naming conventions

constant extraction

logging rules

formatting

Architecture Decision Guide

If the change affects chart runtime behavior
→ modify implementation adapters or sync hooks.

If the change affects reusable chart behavior
→ modify chart facade or generic chart modules.

If the change affects feature behavior
→ modify feature modules.

If the change affects API fetching or mutations
→ implement through TanStack Query.

If the change affects client UI state
→ implement through Zustand.

If the change affects business logic or persistence
→ implement through NestJS services.

Frontend Architecture
Architecture Boundaries (MUST)

The generic chart layer must remain library-agnostic.

Generic chart layer includes:

src/chart/**

except:

src/chart/implementation/scichart/**

Rules:

never import SciChart in generic chart modules

SciChart runtime logic lives only in src/chart/implementation/scichart

feature orchestration lives in src/features

Import Direction Rules

Dependencies must follow:

features → chart facade
features → shared

implementation → chart facade
implementation → shared

chart facade → shared

shared → none

Forbidden imports:

feature → implementation

shared → feature

generic chart → implementation

Chart Facade Enforcement

Feature modules interact with charts only through the chart facade.

Forbidden imports:

src/chart/contracts/*
src/chart/helpers/*
src/chart/implementation/*
Module Patterns
Generic Chart Module Pattern
contracts
→ resolver
→ helpers
→ hook/component facade

Responsibilities:

define library-agnostic contracts

normalize configuration

expose reusable hooks/components

SciChart Implementation Pattern
generic contract
→ adapter
→ runtime sync
→ implementation wiring
Feature Module Pattern
feature contract
→ resolver
→ helpers
→ flow hooks
→ query/mutation hooks
→ UI components
Contract-First API Rule

Group related configuration props into typed contracts.

Bad

dashPattern
dashGap

Good

dash: DashConfig
Resolver Rules

All default logic must exist in resolver functions.

Precedence:

user value
→ feature defaults
→ global defaults
Adapter Boundary Rules

Adapters translate generic contracts to implementation structures.

Adapters must:

remain pure

contain no side-effects

contain no React state

Naming convention:

map[GenericName]To[ImplementationName]

Example:

mapSeriesConfigToSciChart
Hook Taxonomy
Model Hooks

Pure state modeling.

Return:

{ state, derived, actions }
Sync Hooks

Runtime synchronization.

Clean up resources when they allocate them.

Flow Hooks

Compose hooks and coordinate behavior.

Query Hooks

Own TanStack Query reads.

Mutation Hooks

Own TanStack Query writes.

Server State Ownership

TanStack Query owns all server state.

Use TanStack Query for:

API reads

mutations

caching

invalidation

Never duplicate query results into Zustand.

Drafting Pattern (Zustand + Query)

When editing server-managed data:

Do not copy TanStack Query results into Zustand as a second source of truth.

Use this pattern:

TanStack Query provides the canonical server state.

Local useState or a temporary Zustand store holds draft edits.

On Save → send draft via mutation.

On Cancel → discard draft and revert to query cache.

Zustand may be used for drafts only if the draft must be shared across components.

Derived Data Rule

Derived values must be computed using helpers or memoization.

Never store derived values in state.

Visual & Behavioral Constant Rule

Extract configuration values into constants.

Examples requiring constants:

opacity

padding

animation duration

debounce timing

z-index

Allowed inline:

i = 0
x + 1
array indexing

Bad

const ZERO = 0

Good

const HIDDEN_OPACITY = 0
Styling Rules

Prefer MUI styled() for reusable styling.

Use sx for local adjustments.

Inline style objects may be used when:

runtime measurement is required

dynamic dimensions cannot be expressed via theme tokens

third-party integration requires inline styles

Backend Architecture (NestJS)

The backend follows a strict layered architecture:

controller → service → repository/provider

Controllers handle HTTP concerns.
Services implement business logic.
Repositories handle persistence.

Tier 1 — Backend Invariants
Controller Thinness Rule

Controllers may:

accept requests

validate DTO input

call services

return response DTOs

Controllers must not:

implement business logic

access the database directly

coordinate transactional workflows

Service-Level Transactions (MUST)

Business transactions spanning multiple persistence operations must be orchestrated in the Service layer.

Rules:

repositories remain atomic and persistence-focused

services coordinate multi-step workflows

use ORM transaction utilities within services

controllers must never coordinate transactions

Examples:

DataSource.transaction(...)
$transaction(...)
Nested DTO Validation Rule (MUST)

For any DTO property containing nested objects or arrays, validation must recurse.

Rules:

use @ValidateNested()

use @Type(() => TargetDto)

apply appropriate decorators for nested arrays

Without this, ValidationPipe skips nested validation.

Serialization Rule

Controllers must not return persistence models directly.

Map results to response DTOs.

Config Isolation Rule

Never access environment variables directly.

Forbidden:

process.env.API_KEY

Allowed:

ConfigService
Async Error Rule

Throw NestJS exceptions:

BadRequestException
UnauthorizedException
NotFoundException
ForbiddenException

Do not return error-shaped success objects.

Tier 2 — Structural Backend Patterns
Repository Pattern

Repositories own:

database queries

ORM logic

persistence mapping

Services must not embed persistence logic directly.

Relation Loading & N+1 Rule

Repositories must load required relations for the contract they return.

Rules:

services must not perform per-item database queries

avoid N+1 query patterns

return resource shapes sufficient for domain logic

API Symmetry Rule

Create and update endpoints must return the full persisted object mapped to a response DTO.

Rules:

POST returns the created resource

PATCH/PUT returns the updated resource

responses must contain fields needed for frontend cache updates

Frontend-Backend Contract Drift Rule

When backend DTOs change, review and update frontend contracts.

Rules:

shared payload fields must align in name and type

if shapes differ intentionally, add explicit mappers

prevent silent contract drift

Backend Style & Safety
Domain Module Pattern

Backend modules organized by domain.

Example:

UsersModule
AuthModule
ChartModule

Each module contains:

controller
service
repository
dto
Circular Dependency Rule

Avoid circular module dependencies.

Do not use forwardRef() unless necessary.

Guards / Interceptors / Filters

Use:

guards for authentication

interceptors for logging and caching

filters for error transformation

Logging Rule

Use NestJS Logger.

Avoid raw console.log in production code.

Planning Phase

For non-trivial changes, write a short plan.

Tiny edits (formatting, renames, typos) do not require planning.

Plan format:

Plan
Layer
Concern
Files
Tier-1 invariants at risk
Protection strategy
Done When

Work is complete when:

Tier-1 invariants remain intact

resolver precedence remains correct

no SciChart imports appear outside implementation layer

TanStack Query state is not duplicated in Zustand

nested DTO validation is present on complex DTOs

implementation hooks clean up SciChart resources

create/update endpoints return full response DTOs

frontend contracts were reviewed after DTO changes

Architecture Debt Notes

Documents legacy deviations.

Format:

file:
current deviation:
desired architecture:
migration suggestion:
Golden Backend Template
DTO
export class CreateChartDto {
  @IsString()
  name: string

  @ValidateNested()
  @Type(() => ChartConfigDto)
  config: ChartConfigDto
}
Controller
@Controller('charts')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Post()
  create(@Body() dto: CreateChartDto) {
    return this.chartService.create(dto)
  }
}
Service
@Injectable()
export class ChartService {
  constructor(private readonly repo: ChartRepository) {}

  async create(dto: CreateChartDto) {
    const processed = this.applyLogic(dto.config)
    return this.repo.save({ ...dto, config: processed })
  }

  private applyLogic(config: ChartConfigDto) {
    return config
  }
}
