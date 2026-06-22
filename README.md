# Atria

Atria is a calendar-first personal planning system built as a polished portfolio MVP. It combines weekly scheduling, flexible day tasks, a focused Today dashboard, lightweight insights, recurring routines, local persistence, and a cinematic Soft Rose Glass interface.

## Features

- Weekly calendar with Sunday or Monday week-start preference
- Scheduled events and flexible day tasks
- Create, edit, complete, delete, duplicate, and copy items
- Recurring events and tasks: daily, weekly, and monthly
- Per-occurrence completion for recurring items
- Drag-and-drop planning across the week
- Today dashboard with daily progress, tasks, schedule, focus line, and category pulse
- Insights dashboard for weekly progress, focus hours, category balance, daily rhythm, and routine consistency
- Global command palette with search, navigation, creation commands, and demo reset
- Settings page for app preferences, appearance notes, and local data controls
- Demo data reset for screenshots and walkthroughs
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
- Daily focus entries: `atria-daily-focus`
- Settings preferences: `atria-settings-preferences`

Stored calendar data is normalized on read so older or partially invalid data can safely fall back to defaults.

## Current Limitations

- No backend sync or authentication
- No multi-device persistence
- Recurring item editing/deletion applies to the whole series
- No single-occurrence recurring edits yet
- Dragging recurring occurrences moves the source series
- Default view redirects only from the root route
- Week-start preference affects the app going forward but does not rewrite existing item dates

## Why Atria Is Different

Atria is not a Notion or Todoist clone. It starts from time.

The core object is the calendar: tasks belong to days, events occupy time, routines repeat into the week, and Today answers what matters now. The product direction is closer to a futuristic personal planning cockpit: calendar-first, time-based, daily-focused, insight-aware, and wrapped in a soft cinematic glass UI.

## Roadmap

- Single-occurrence editing for recurring items
- Recurring exception dates
- Habit/routine-specific views
- Notes attached to events
- Project and goal scheduling
- Supabase sync
- Authentication
- Mobile-first planning refinements
- Export/import local data

## Deployment

The app is ready for Vercel. A `vercel.json` rewrite is included so direct navigation to client routes works correctly.
