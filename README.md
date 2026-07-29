# Atria

Atria is a local-first calendar for shaping intentions, finding suitable time, reflecting on completed days, and noticing gentle patterns without productivity scoring.

It is designed as a calm calendar that helps you shape, understand, and remember your time. Calendar items represent committed time, intentions represent outcomes, focus sessions connect intentions to time, reflections capture what mattered, Memories revisit past days, and Insights describe patterns cautiously.

## Status

Release candidate: `1.0.0-rc.1`

This is a portfolio-ready MVP, not a cloud product. There is no authentication, backend sync, external calendar provider, payment system, collaboration, or external AI service.

## Features

- Public Atria front page with a quiet product story
- First-run onboarding for the local workspace
- Weekly calendar with configurable week start
- Scheduled events and flexible day tasks
- Create, edit, complete, delete, duplicate, copy, and drag calendar items
- Daily, weekly, and monthly recurring events/tasks
- Per-occurrence completion for recurring items
- Today dashboard with current/next commitments, primary intention, daily load, energy, and reflection
- Intentions inbox for outcomes before scheduling
- Transparent rule-based planning suggestions and accepted focus sessions
- Tasks page with date grouping plus goal/project filters
- Goals and Projects pages with linked task progress
- Memories timeline derived from calendar items, completed intentions, and reflections
- Gentle Insights with evidence thresholds and confidence labels
- Command palette with navigation and creation commands
- Settings for planning defaults, energy profile, appearance themes, onboarding, export, demo data, and clear-data controls
- Selectable themes: Soft Rose Glass, Violet Dusk, Blue Hour, and Ember Noir
- Local JSON export for backups

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Zustand
- Framer Motion
- `@dnd-kit/core`
- `date-fns`
- CSS Modules
- LocalStorage
- Vitest

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm run test:run
```

Preview the production build:

```bash
npm run preview
```

## Data And Privacy

Atria is local-first in the current version. Data is stored in the browser through LocalStorage service boundaries:

- Calendar items: `atria-events`
- Daily focus entries: `atria-daily-focus`
- Intentions: `atria-intentions`
- Reflections: `atria-reflections`
- Goals: `atria-goals`
- Projects: `atria-projects`
- Settings: `atria-settings-preferences`

No behavioural data is sent to a server. No external AI API is used. Exports are created locally as JSON files. Clearing browser storage may remove Atria data, so export a backup if portability matters.

## Demo Flow

1. Open Settings and choose `Load sample data`.
2. Open Calendar and scan the weekly orbit.
3. Add or edit an event.
4. Drag a flexible task to another day.
5. Open Today to show current commitments, primary intention, energy, and reflection.
6. Open Intentions and create an outcome.
7. Use Find time from an intention and accept a focus session.
8. Open Memories and search a reflected day.
9. Open Tasks and filter by goal or project.
10. Open Goals and Projects to inspect linked progress.
11. Open Insights to show gentle evidence-backed observations.
12. Open the command palette with Cmd/Ctrl + K.
13. Export local data from Settings.

## Architecture

Routes live in `src/app/router.tsx` and are lazy-loaded. Feature domains own their own stores, services, utilities, types, and normalization. Pages compose features and shared UI. Shared services remain domain-neutral.

Important boundaries:

- Calendar owns events, tasks, recurrence, drag movement, and focus-session calendar records.
- Intentions own outcome capture and status.
- Planning owns deterministic suggestion scoring.
- Reflections own daily reflection records.
- Memories and Insights are derived at view time and are not stored as duplicated data.
- Settings owns preferences, onboarding state, theme selection, and energy profile.
- Data export reads normalized source stores and does not export derived Memories or Insights.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more detail.

## Current Limitations

- Browser-local storage only
- No cross-device sync
- No import flow yet
- No external calendar import/export
- No collaborative calendars
- No notifications
- Local timezone assumptions
- Rule-based planning rather than autonomous scheduling
- Recurring edits/deletes apply to the whole series
- Dragging recurring occurrences moves the source series
- Memories are derived from current source records, so historical views can change when source records are edited
- Accepted focus sessions are single scheduled blocks
- Insights are thresholded heuristics, not AI analysis or behavioural diagnosis

## Deployment

The app is ready for Vercel-style SPA hosting. `vercel.json` rewrites direct route requests to `index.html`.
