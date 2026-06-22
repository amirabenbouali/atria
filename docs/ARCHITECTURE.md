# Atria Architecture

Atria is calendar-first. Time is the primary object, and tasks, habits, projects, notes, and goals should attach to time rather than becoming disconnected lists.

## Source Layout

```txt
src/
  app/                 Application wiring, providers, routes, and router setup.
  pages/               Route-level screens that compose features and shared layout.
  features/            Domain-owned product areas, starting with calendar.
  shared/              Reusable UI, hooks, services, utilities, and common types.
  styles/              Global reset, tokens, effects, and base application styles.
  assets/              Static images and icons.
```

## Boundaries

`app/` owns bootstrapping. It should not contain calendar business logic.

`pages/` compose features. Pages can connect stores to components, but they should avoid persistence, date math, and mutation logic.

`features/calendar/` owns the calendar domain: event types, constants, state, storage services, date utilities, and calendar-specific components.

`shared/` contains code that is useful outside a single feature. Shared code should not import from feature folders.

`styles/` contains global design language: tokens, reset, aurora effects, and base typography. Component-specific styling belongs beside the component as a CSS Module.

## Data Flow

```txt
Page
  -> feature hooks / Zustand store
  -> feature services
  -> shared browser services
  -> LocalStorage now, Supabase later
```

Components receive data and callbacks. Business rules live in stores, services, and utilities.

## Current Feature Scope

The current calendar feature supports the MVP prototype behavior:

- weekly Monday-Sunday calendar
- localStorage-backed events
- add event modal
- delete event
- mark complete

React DnD and larger calendar libraries are intentionally deferred until the scheduling interaction model needs them.
