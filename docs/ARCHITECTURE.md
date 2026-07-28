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

`features/calendar/` owns the calendar domain: event and task types, recurrence, drag-and-drop movement rules, state, storage services, date utilities, and calendar-specific components.

`features/goals/` and `features/projects/` own longer-range planning entities and their LocalStorage-backed state.

`features/intentions/` owns the typed domain foundation for desired outcomes that may later become scheduled focus sessions. It is intentionally separate from calendar events and tasks.

The user-facing intention inbox lives at `/intentions`. Quick capture uses a small deterministic parser for supported phrases such as relative deadlines, durations, time-of-day hints, and priority signals. It is not an AI service and does not place intentions onto the calendar.

`features/reflections/` owns lightweight daily reflection data keyed by local calendar date. Reflection state should not be placed inside the calendar store.

`features/timeQuality/` owns shared time-quality and energy vocabulary for future planning suggestions and reflection metadata.

Energy profiles are explicit user preferences stored in settings. The current profile uses three fixed local day periods: morning `05:00-11:59`, afternoon `12:00-16:59`, and evening `17:00-23:59`, with `00:00-04:59` falling back to evening. Atria does not learn from behaviour or make scheduling suggestions from this profile yet.

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

The current product supports the portfolio MVP behavior:

- weekly calendar with configurable week start
- LocalStorage-backed events and flexible tasks
- add event modal
- recurring events and tasks
- per-occurrence recurring completion
- drag-and-drop task and event movement with `@dnd-kit/core`
- Today, Tasks, Goals, Projects, Insights, Settings, and command palette routes
- an Intentions inbox for capturing outcomes before scheduling
- domain foundations for daily reflections and time quality

React Big Calendar and backend storage are intentionally deferred. LocalStorage remains the current persistence layer behind feature service boundaries.

## Testing

Vitest covers pure domain utilities, normalization, and persistence edge cases. Component and browser tests are not part of the current setup.
