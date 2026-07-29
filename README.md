# Atria

A calm, local-first calendar for shaping intentions, finding focus time, reflecting on completed days, and understanding how your time is taking shape.

![React](https://img.shields.io/badge/React-111111?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-111111?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-111111?style=flat&logo=vite)
![Vitest](https://img.shields.io/badge/Tests-Vitest-111111?style=flat&logo=vitest)
![Version](https://img.shields.io/badge/version-1.0.0--rc.1-111111)

## Preview

<!-- Add the main Atria dashboard screenshot here -->

No deployment URL is committed in this repository. The app is configured for Vercel-style SPA hosting through `vercel.json`.

## Why Atria

Traditional calendars record where time goes, but they often provide little support for deciding what deserves that time. Atria separates fixed commitments from flexible intentions, then helps the user connect the two through transparent planning suggestions.

The product is built around a calmer model:

- Commitments occupy time.
- Intentions describe outcomes the user wants to move forward.
- Planning suggestions look for appropriate open space.
- Reflections preserve what mattered.
- Memories and Insights surface patterns without judgement or productivity scoring.

Atria is not an AI calendar, an autonomous scheduler, a mental-health application, or a cloud collaboration platform. Its planning and insight features are deterministic, local, and explainable.

## Core Features

### Calendar

- Day, week, and month calendar views
- Scheduled events and flexible day tasks
- Event/task creation, editing, completion, deletion, duplication, and copying
- Daily, weekly, and monthly recurring items
- Per-occurrence completion and single-occurrence edits for recurring items
- Drag-and-drop movement for tasks and events, including scheduled time changes
- Manual task ordering with accessible move controls
- Configurable week start, weekend visibility, default view, clock format, and default event duration
- Local persistence through LocalStorage service boundaries

### Intentions

- Intention inbox for outcomes before scheduling
- Quick capture and structured intention details
- Statuses for active, scheduled, completed, and paused intentions
- Priority, deadline, estimated duration, preferred time of day, and energy requirement fields
- Next-action helper text derived from intention state

### Transparent Planning

- Bounded calendar occurrence expansion for the planning range
- Free-gap detection across existing commitments
- Candidate focus-window generation
- Deterministic scoring using duration fit, preferred time quality, energy compatibility, deadlines, buffers, and daily calendar load
- Explainable reasons and warnings for each suggestion
- Manual approval before a focus session is created

The planning engine does not use an external AI service.

### Today

- Current and next commitments
- Primary intention context
- Accepted focus sessions
- Expected energy and daily load
- Daily reflection entry with energy, mood, note, and highlight
- Quick access to planning suggestions for the primary intention

### Tasks, Goals, And Projects

- Tasks page with all flexible tasks grouped by date
- Goal and project filters for tasks
- Goals with active/completed/archived states and linked task progress
- Projects linked to goals and tasks
- Project depth signals for stage, impact, and complexity
- Project detail drawer with linked tasks and progress

### Memories

- Historical timeline derived from calendar items, completed intentions, and reflections
- Month navigation
- Search and filters for events, focus sessions, reflections, completed intentions, and highlights
- Private memory views generated from current source records

### Gentle Insights

- Deterministic observations from local evidence
- Evidence thresholds and cautious confidence labels
- Focus, calendar-load, recovery, intention, reflection, energy, and project patterns
- Dismissible insights
- No behavioural profiling service or external analysis

### Command Palette

- Cmd/Ctrl + K command palette
- Navigation and creation commands
- Search across calendar items, goals, projects, and intentions
- Deep search through linked goal/project/intention context

### Your Observatory

- Local-first workspace setup, open-workspace flow, and browser-local logout controls
- Profile and focus text
- Atmosphere themes and accent customisation
- Calm, Balanced, and Planner workspace modes
- Calendar behaviour preferences
- Energy profile by day period
- Notification preferences for in-app prompts
- Demo data reset, clear-data controls, and local JSON import/export
- Live workspace preview

## Product Principles

- Local-first: Atria works from browser-local data in the current MVP.
- User-controlled scheduling: suggestions are never scheduled until the user accepts them.
- Transparent rules: planning and insight logic is deterministic and testable.
- No productivity scoring: Insights describe patterns without turning the user into a score.
- Privacy by default: no account, backend, external AI API, or behavioural data transfer is required.
- Calm interface: the UI favours dark glass surfaces, restrained motion, and low-clutter planning.
- Accessibility basics: semantic controls, labels, keyboard shortcuts, skip links, and modal Escape handling are implemented across core flows.

## Technology Stack

Application:

- React
- TypeScript
- Vite
- React Router

State and data:

- Zustand
- LocalStorage
- `date-fns`

Interaction and UI:

- Framer Motion
- `@dnd-kit/core`
- Lucide React
- CSS Modules

Testing:

- Vitest

## Architecture

```text
src/
├── app/        application setup, routing, default route, and error boundary
├── assets/     repository-local static assets
├── features/   domain logic, stores, services, utilities, types, and feature components
├── pages/      route-level screens composed from features and shared UI
├── shared/     reusable UI primitives, components, services, hooks, and utilities
└── styles/     tokens, global styles, and visual effects
```

Routes are lazy-loaded from `src/app/router.tsx`:

- `/`
- `/workspace`
- `/calendar`
- `/today`
- `/tasks`
- `/intentions`
- `/memories`
- `/goals`
- `/projects`
- `/insights`
- `/settings`

Key boundaries:

- Route-level pages compose product surfaces and keep business rules out of JSX where possible.
- Feature folders own their domain stores, services, utilities, and types.
- Zustand stores manage feature state and expose user actions.
- LocalStorage access goes through service boundaries that normalize stored data on read.
- Memories and Insights are derived at view time rather than persisted as separate snapshots.
- Recurring calendar items are stored as source series and expanded for visible/planning ranges.

## Planning Engine

The planning engine lives in `src/features/planning`.

At a high level, it:

1. Expands relevant calendar occurrences within a bounded search range.
2. Identifies valid open gaps around existing commitments.
3. Creates candidate focus windows that fit the intention's estimated duration.
4. Scores candidates using explicit user preferences and calendar context.
5. Presents reasons and warnings for each suggestion.
6. Creates a focus session only after manual acceptance.

Implemented scoring context includes duration fit, preferred time quality, energy compatibility, deadlines, buffers, nearby commitments, and daily calendar load. The engine is deterministic and does not call an external AI service.

## Data Model

- Calendar items are scheduled events or flexible tasks. Tasks may link to goals and projects.
- Recurring calendar items are stored once and expanded into occurrences when needed.
- Focus sessions are scheduled calendar items linked to intentions.
- Intentions represent outcomes and can become scheduled through accepted planning suggestions.
- Reflections are daily records keyed by local date.
- Goals and projects provide long-range structure and derive progress from linked tasks.
- Memories derive from past events, focus sessions, completed intentions, and reflections.
- Insights derive from recent source data and are not stored as behavioural profiles.
- Settings store profile, appearance, calendar preferences, onboarding state, notifications, and energy profile.
- Account/session settings store the local workspace sign-in state for this browser.

## Local-First Data And Privacy

Atria stores current MVP data in browser LocalStorage:

- Calendar items: `atria-events`
- Daily focus entries: `atria-daily-focus`
- Intentions: `atria-intentions`
- Reflections: `atria-reflections`
- Goals: `atria-goals`
- Projects: `atria-projects`
- Settings: `atria-settings-preferences`

No account is required. No behavioural data is sent to a server. No external AI API is used. Backups are imported and exported locally as JSON files. Importing an Atria backup replaces the current local workspace after confirmation. Clearing browser storage may remove Atria data, so use the export flow before resetting or moving devices.

The sign-in/logout flow is intentionally local for this MVP. Logging out returns the user to the front-page workspace options and hides direct app routes, but it does not encrypt, delete, or protect browser LocalStorage like real authentication would.

## Getting Started

```bash
git clone https://github.com/amirabenbouali/atria.git
cd atria
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run the test suite:

```bash
npm run test:run
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript project checks and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run the Vitest suite once |

There is no lint script in the current repository.

## Testing

Atria uses Vitest for domain and integration-style tests. Current coverage areas include:

- calendar time, view-mode, recurrence-adjacent, and task-ordering utilities
- command palette deep search
- local data export and import
- intention parsing, validation, filtering, status changes, and next actions
- planning availability, scoring, validation, and suggestion generation
- project depth calculations
- reflection validation
- Memories timeline grouping, recurrence handling, search, and filters
- Gentle Insights thresholds, ranking, confidence labels, and stable IDs
- settings storage migration, preferences, and energy profile actions
- time-quality guards and presentation
- notification rule derivation

Use:

```bash
npm run test:run
```

No coverage percentage is published in the repository.

## Accessibility

Implemented accessibility basics include:

- semantic buttons, forms, sections, and navigation
- labelled icon-only controls
- dialog roles and `aria-modal` on modal surfaces
- Escape handling for modals, command palette, notification center, and drawers
- Cmd/Ctrl + K command palette shortcut that ignores editable fields
- keyboard navigation for the command palette and custom select controls
- skip link to the main workspace content
- toast/status semantics for storage warnings
- responsive layouts and horizontally scrollable calendar views where needed

Full keyboard-only and screen-reader audits are still listed as release checklist items.

## Design System

Atria's visual system is implemented through CSS Modules, global tokens, and shared UI primitives.

- `src/styles/tokens.css` defines semantic colours, radii, shadows, typography, and theme overrides.
- Atmosphere themes are applied through dataset attributes on `document.documentElement`.
- Accent and workspace-mode preferences are stored in settings and reflected through CSS variables.
- Shared primitives such as `AtriaIcon`, `AtriaCapsule`, `AtriaBadge`, `AtriaStat`, `Button`, `Modal`, `SelectControl`, and `GlassPanel` keep repeated UI patterns consistent.
- The UI uses dark glass surfaces, restrained rose/mauve accents, and responsive constraints rather than Tailwind utility classes.

## Engineering Highlights

- Feature-based TypeScript architecture with clear domain boundaries.
- LocalStorage service boundaries with normalization and migration-friendly reads.
- Bounded recurring-item expansion instead of permanently duplicating occurrences.
- Deterministic planning suggestions with explainable reasons and warnings.
- Cross-domain derivation for Today, Memories, Insights, goals, and projects.
- Deep command palette search across linked calendar, goal, project, and intention data.
- Safe local JSON import/export for portfolio demos and backup workflows.
- Automated tests for critical planning, persistence, derivation, and search logic.

## Project Status

Atria is currently a portfolio-ready local-first release candidate: `1.0.0-rc.1`.

The main product flows are implemented and tested. Cloud sync, external calendar integrations, real user accounts, and collaboration are outside the current scope.

## Current Limitations

- Browser-local storage only
- No cross-device sync
- No real user accounts, authentication, password reset, or cloud session management
- No external calendar import/export
- No collaboration
- No browser push notifications
- Local timezone assumptions
- No automatic scheduling without user approval
- Backup import is replace-only, not a merge flow
- Historical Memories can change when source records are edited
- Insights are deterministic heuristics, not AI analysis or behavioural diagnosis
- Full keyboard-only, screen-reader, visual regression, and deployed-environment QA are not yet complete

## Roadmap

Possible future directions:

- optional encrypted backup and sync
- external calendar import/export
- safer backup merge and conflict handling
- improved timezone support
- browser E2E smoke tests and visual regression coverage
- expanded accessibility testing

## Repository Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Testing](docs/testing.md)
- [Release checklist](docs/release-checklist.md)
- [Changelog](CHANGELOG.md)

## Contributing

This repository is currently maintained as a portfolio project. If you are reviewing the codebase, start with the feature folders under `src/features`, then read the route-level composition in `src/pages`.
