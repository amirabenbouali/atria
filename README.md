# Atria

Atria is a calendar-first personal planning system built as a polished portfolio MVP. It combines weekly scheduling, flexible tasks, goals, projects, a focused Today dashboard, insights, recurring routines, local persistence, and a cinematic Soft Rose Glass interface.

This is not a Notion clone or a generic task list. Atria starts from time: events occupy the calendar, tasks belong to days, projects organize workstreams, and goals give long-term direction.

## Features

- Weekly calendar with Sunday or Monday week-start preference
- Public front page with a quiet Soft Rose Glass product story
- Scheduled events and flexible day tasks
- Create, edit, complete, delete, duplicate, copy, and drag items
- Recurring events and tasks: daily, weekly, and monthly
- Per-occurrence completion for recurring items
- Tasks page with date grouping plus goal/project filters
- Goals page with goal cards, linked projects, linked tasks, and progress
- Projects page with project cards, linked goals, progress, and a detail drawer
- Project detail drawer with linked task actions and prelinked task creation
- Calm Today view with current/next commitments, one primary intention, expected energy, daily load, and optional reflection
- Insights dashboard for weekly progress, focus hours, category balance, routines, and project health
- Global command palette with search, navigation, creation commands, and demo reset
- Settings page for app preferences, appearance notes, and local data controls
- Transparent rule-based planning suggestions for active intentions
- Accepted focus sessions linked back to intentions
- Coherent demo data reset for screenshots and walkthroughs
- Soft Rose Glass theme with dark glossy surfaces and warm rose/mauve accents

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Zustand
- Framer Motion
- @dnd-kit/core
- date-fns
- CSS Modules
- LocalStorage

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data Storage

Atria is an MVP with no backend. Data is stored locally in the browser:

- Calendar items: `atria-events`
- Goals: `atria-goals`
- Projects: `atria-projects`
- Daily focus entries: `atria-daily-focus`
- Daily reflections: `atria-reflections`
- Settings preferences: `atria-settings-preferences`

Stored data is normalized on read so older or partially invalid LocalStorage values can safely fall back to defaults.

Planning suggestions are temporary and are not stored as separate records. When accepted, they become normal timed calendar events in `atria-events` with metadata linking them to the source intention.

## Demo Flow

1. Reset demo data from the sidebar or command palette.
2. Open the front page at `/` and enter the workspace.
3. Open Calendar and scan the sample week.
4. Add or edit an event.
5. Drag a flexible task to another day.
6. Open Today to show the current moment, primary intention, daily load, and reflection entry point.
7. Open Tasks and filter by goal or project.
8. Open Goals and expand a goal to show linked projects and tasks.
9. Open Projects and click a project card to reveal the detail drawer.
10. Create a new task from the project drawer.
11. Open Insights to show weekly analytics and project health.
12. Open the command palette with Cmd/Ctrl + K and navigate or create from there.

## Current Limitations

- No backend sync or authentication
- Front-page sign-in and onboarding are visual prototype flows only
- No multi-device persistence
- Recurring item editing/deletion applies to the whole series
- No single-occurrence recurring edits yet
- Dragging recurring occurrences moves the source series
- Project and goal progress use a stable MVP calculation rather than historical analytics
- Deleting a project removes task `projectId` links but preserves task `goalId` for safety
- Default view redirects from `/workspace`; direct app routes remain available
- Planning suggestions are deterministic heuristics, not AI or behavioural learning
- Accepted focus sessions are single blocks only, not recurring sessions
- Today load is a scheduling heuristic based on timed commitments, not a productivity score
- Expected energy comes from explicit settings, not behavioural inference

## Why Atria Is Different

Atria treats time as the primary object. Tasks are planned into days, events reserve time, projects structure workstreams, and goals connect the week to a larger direction.

The product direction is closer to a futuristic personal planning cockpit: calendar-first, time-based, daily-focused, insight-aware, and wrapped in a soft cinematic glass UI.

## Roadmap

- Single-occurrence editing for recurring items
- Recurring exception dates
- Project detail routes
- Notes attached to events
- Import/export local data
- Supabase sync
- Authentication
- Mobile-first planning refinements

## Deployment

The app is ready for Vercel. A `vercel.json` rewrite is included so direct navigation to client routes works correctly.
