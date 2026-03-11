# NestJS Backend Rules

This file governs backend code.

---

# Critical Backend Invariants (MUST NEVER BE VIOLATED)

1. Controllers handle transport only.
2. Business logic lives in services.
3. Persistence and external IO live in repositories/providers.
4. Controllers must not return persistence models directly.
5. Request boundaries must use validated DTOs.
6. Service methods must throw exceptions, not return error-shaped success objects.
7. Environment values must be accessed via injected config, not `process.env`.
8. Create/update endpoints must return full response DTOs when frontend cache updates depend on them.

---

# Backend High-Pass Filter

Before writing backend code, verify:

- no business logic in controllers
- no direct DB access in controllers
- request input uses DTO classes
- nested DTOs use recursive validation
- services use dependency injection, not `new Service()`
- transactions spanning multiple operations are coordinated in services
- repositories own relation loading and query strategy
- controllers return response DTOs, not ORM entities
- changes to DTOs trigger frontend contract review

---

# Backend Layering

Use the layered structure:

controller  
→ service  
→ repository/provider

## Controller

Owns:

- routing
- request/response transport
- DTO boundary
- HTTP decorators
- status codes when needed

Must not own:

- business logic
- persistence
- transaction orchestration

---

## Service

Owns:

- business logic
- multi-step workflows
- transaction orchestration
- domain validation beyond DTO shape validation

---

## Repository / Provider

Owns:

- ORM queries
- raw DB access when necessary
- persistence mapping
- external API / infrastructure access where appropriate

---

# Controller Thinness Rule (MUST)

Controllers may:

- accept requests
- validate DTO input
- call services
- return response DTOs or serialized results

Controllers must not:

- implement business rules
- access the database directly
- coordinate multi-step workflows
- return ad hoc unstable response shapes

---

# DTO Mandatory Rule (MUST)

Use class-based DTOs for:

- `@Body()`
- structured `@Query()`
- structured `@Param()`

Rules:

- use `class-validator`
- use `class-transformer` where needed
- use mapped types for update DTOs when appropriate
- never use `any` or `Record<string, any>` as request contracts

---

# Nested DTO Validation Rule (MUST)

For any DTO field that is an object or an array of objects, nested validation must be explicit.

Rules:

- use `@ValidateNested()`
- use `@Type(() => TargetDto)`
- apply array validation decorators when needed

Do not rely on top-level validation to validate nested chart configuration or nested payload structures.

---

# Validation Pipeline Rule (MUST)

Use a global validation pipe with:

```ts
whitelist: true
forbidNonWhitelisted: true
transform: true

Do not duplicate validation logic manually when DTO validation already owns the boundary.

Service-Level Transactions (MUST)

Business transactions spanning multiple persistence operations must be orchestrated in the Service layer.

Rules:

repositories remain atomic and persistence-focused

services coordinate multi-step transactional workflows

use the ORM transaction utility in the Service layer

controllers must never coordinate transactions

Examples:

TypeORM: DataSource.transaction(...)

Prisma: $transaction(...)

Data Access Boundary Rule (MUST)

Persistence must be isolated.

Rules:

controllers must never access the database directly

services must use repositories or providers

persistence logic must not be scattered across services

If raw queries are necessary, isolate them in the data-access layer.

Relation Loading and N+1 Rule (MUST)

Repositories and data-access providers own relation-loading strategy for the contract they return.

Rules:

load the relations required by the service or response contract

services must not contain loops that trigger per-item database queries

do not return incomplete resource shapes that force multiple follow-up API calls for core data

Prefer deliberate joins, includes, or equivalent ORM mechanisms where appropriate.

Serialization Rule (MUST)

Do not return ORM entities, documents, or persistence models directly from controllers.

Map results to:

response DTOs

serialized API response objects

Do not leak internal fields or persistence-only fields.

API Symmetry Rule (MUST)

Create and update endpoints must return the full persisted object mapped to a response DTO, unless there is a documented reason not to.

Rules:

POST returns the created resource

PATCH / PUT returns the updated resource

response DTOs include the fields required for frontend cache updates

Do not return only { success: true } when the frontend depends on resulting object state.

Config Isolation Rule (MUST)

Do not access process.env directly in services.

Use ConfigService or an equivalent injected configuration provider.

Centralize defaults and environment interpretation.

Async Error Rule (MUST)

Throw Nest exceptions or domain errors.

Use standard exceptions such as:

BadRequestException

UnauthorizedException

ForbiddenException

NotFoundException

Do not return error-shaped success objects like:

{ ok: false }
{ error: "..." }
API Contract Alignment Rule (MUST)

Backend request/response DTOs and frontend contracts must stay aligned at the API boundary.

Rules:

use the same field names and compatible types when representing the same payload

when shapes differ intentionally, provide an explicit mapper

do not allow silent drift between backend DTOs and frontend feature/query contracts

Domain Module Pattern

Organize backend code by domain modules.

Example modules:

UsersModule

AuthModule

ChartModule

BillingModule

Each domain module should typically contain:

controller

service

repository/provider

DTOs

Avoid giant shared modules.

Circular Dependency Rule

Avoid circular module and provider dependencies.

Do not use forwardRef() unless there is no cleaner boundary available.

If forwardRef() is required, document why.

Guards / Interceptors / Filters Rule

Use NestJS infrastructure for cross-cutting concerns.

Use:

guards for authentication and authorization

interceptors for logging, transformation, and caching

filters for consistent error shaping

Do not duplicate these behaviors across controllers.

Logging Rule

Use NestJS Logger or a shared logging abstraction.

Avoid raw console.log in production code.

Dependency Discipline

Do not introduce new backend packages unless explicitly requested.

Prefer:

standard TypeScript

native JavaScript APIs

existing project libraries

Request / Response DTO Separation Rule

Do not reuse the same DTO for request validation and response serialization unless the shape is intentionally identical.

Rules:

request DTOs validate input

response DTOs define public API shape

persistence models must not be exposed as response DTOs

Testing Expectations

Controllers and services should have unit tests covering:

happy path

one error path

one edge case

For mutation-related service changes, test the returned response shape when frontend cache updates depend on it.