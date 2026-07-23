# ADR 0001: Frontend Architecture (Standalone + Signals + Feature Stores)

Status: Accepted

Date: 2026-07-09

## Context

This repository is an Angular 22 application focused on resistor and circuit calculation workflows.

The team needs a stable frontend architecture that:

- scales across independent features without tight coupling,
- keeps domain logic testable and easy to review,
- avoids framework-level complexity not needed for current scope,
- remains consistent with Angular standalone and signal-first patterns.

Current project constraints and practices:

- Standalone components only, no NgModules.
- Signals as the primary reactive model for UI and state projection.
- Zoneless change detection.
- Feature-scoped state stores (`ResistorStore`, `CircuitStore`) with Signal Forms.
- Domain calculation logic in services, not components.
- Explicit mappers and validators in dedicated files.
- Shared utilities, pipes, and reusable UI controls under `src/app/shared/`.

## Decision

Adopt and formalize a feature-first architecture with strict role boundaries:

1. Components orchestrate UI interactions and delegate business behavior.
2. Feature stores own form state, derived view models, and feature-level state transitions.
3. Services contain domain calculations and return explicit result models.
4. Mapper functions handle form-to-domain and domain-to-view-model transformations.
5. Validator functions remain pure and live in dedicated validator modules.
6. Validation messages are centralized in message mapping modules.
7. Shared cross-feature code lives under `src/app/shared/` and is imported directly.
8. Cross-folder imports use path aliases (`@app/*`, `@shared/*`, `@resistor/*`, `@circuit/*`).

## Consequences

### Positive

- Better testability: service, mapper, validator, and store logic can be unit tested independently.
- Lower coupling between UI templates and domain rules.
- Predictable extension path for new features and tools.
- Easier code reviews due to consistent file-level responsibilities.

### Trade-offs

- More files per feature and more explicit plumbing (store/mappers/validators/messages).
- Slight onboarding overhead for contributors unfamiliar with this split.
- Requires discipline to prevent business logic from drifting back into components.

## Alternatives Considered

### 1) Component-centric logic (fat components)

Rejected because it mixes template orchestration and domain behavior, increasing regression risk and reducing test isolation.

### 2) RxJS-first state for feature state management

Rejected because the project standard is signal-first reactivity and does not require stream-heavy state orchestration for current complexity.

### 3) Global centralized app store

Rejected because current features are mostly independent and benefit from local feature-scoped stores with explicit boundaries.

## Scope and Non-Goals

This ADR defines frontend architecture conventions for Angular application code in this repository.

Non-goals:

- Backend or API contract architecture.
- CI/CD workflow design.
- Visual design system specification.
- Build and deployment infrastructure strategy.

## Evolution Notes

- URL state, shareable links, and hydration/sync flows are expected to remain feature-level orchestration concerns, with parsing/mapping in state-layer utilities.
- Persistence features (history/presets) should follow the same split: service for I/O, store for orchestration, mappers/validators for transformation and rules.
- Future features should mirror this structure to maintain consistency and reduce maintenance cost.
