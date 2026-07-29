# Atria Architecture

Atria is calendar-first. Time is the primary object, intentions describe outcomes, focus sessions connect outcomes to time, reflections record what mattered, and Memories/Insights are derived from source records.

## Source Layout

```txt
src/
  app/                 Router, providers, default route, error boundary.
  pages/               Route-level screens that compose features and shared layout.
  features/            Domain-owned state, services, utilities, types, and components.
  shared/              Reusable UI, services, and small utilities.
  styles/              Global reset, tokens, effects, and base styles.
```

## Routes

The public front page is `/`. The app workspace is available through `/workspace`, which redirects to the saved default view. Direct routes remain available:

- `/calendar`
- `/today`
- `/tasks`
- `/intentions`
- `/memories`
- `/goals`
- `/projects`
- `/insights`
- `/settings`

Unknown routes render a restrained Not Found page. Workspace routes use `AppLayout`, which provides the sidebar, command palette shortcut, onboarding modal, page title updates, storage warning toast, skip link, and optional contextual panel.

## Feature Boundaries

- `features/calendar` owns calendar events, flexible tasks, recurrence, drag-and-drop movement rules, daily focus text, and accepted focus sessions.
- `features/intentions` owns desired outcomes, quick capture, filtering, status transitions, and persistence.
- `features/planning` owns deterministic suggestion scoring. Suggestions are temporary until accepted.
- `features/reflections` owns daily reflections keyed by local date.
- `features/timeQuality` owns energy and time-quality vocabulary.
- `features/memories` derives a private timeline from calendar items, completed intentions, and reflections.
- `features/insights` derives thresholded observations from local evidence.
- `features/goals` and `features/projects` own long-term planning entities.
- `features/settings` owns preferences, theme selection, onboarding state, and energy profile.
- `features/dataExport` creates typed local JSON backups from normalized source stores.
- `features/dataImport` restores supported Atria JSON backups through the same storage boundaries and hydrates stores after import.

Pages compose feature state and UI, but business rules should remain in stores, services, and utilities.

## Persistence

Atria uses LocalStorage for the MVP. Each domain has a service boundary and normalizes stored values on read.

Current keys:

- `atria-events`
- `atria-daily-focus`
- `atria-intentions`
- `atria-reflections`
- `atria-goals`
- `atria-projects`
- `atria-settings-preferences`

The shared LocalStorage service handles malformed reads and write failures without crashing the app. In development it logs diagnostic context; in the UI, workspace pages show a restrained storage warning toast.

## Onboarding

Onboarding is a short, skippable modal shown for workspace routes until settings contain:

```ts
hasCompletedOnboarding: true
onboardingVersion: 1
```

Skipping counts as completion. Settings can reopen onboarding by resetting the completion flag.

## Themes

Theme selection is stored in settings as `themeId`. `useApplyTheme` applies the selected theme to `document.documentElement.dataset.theme`; CSS token overrides then update the app shell, controls, ambient lights, and major accents.

Current themes:

- Soft Rose Glass
- Violet Dusk
- Blue Hour
- Ember Noir

## Derived Data

Memories and Insights are derived at view time. They are not persisted as separate snapshots. Editing source records can therefore change historical views, which is an explicit MVP tradeoff.

Recurring calendar items are stored as source series and expanded only for visible ranges. Export includes recurrence sources, not generated occurrences.

## Import And Export

The export service creates:

```ts
type AtriaExport = {
  exportedAt: string;
  appVersion: string;
  schemaVersion: 1;
  calendar: { events: CalendarEvent[]; dailyFocusByDate: Record<string, string> };
  intentions: Intention[];
  reflections: ReflectionsByDate;
  goals: Goal[];
  projects: Project[];
  settings: SettingsPreferences;
};
```

The import service currently supports schema version `1` and uses a replace-only restore flow. Imported sections are written through feature storage services, then Zustand stores hydrate from normalized storage so the workspace updates immediately.

## Error Handling

`ErrorBoundary` catches unexpected render failures and presents a calm recovery page. It does not erase storage. Validation errors remain handled inside forms and domain utilities.

## Testing

Vitest covers domain utilities, validation, persistence normalization, settings actions, export payload shape, planning logic, Memories derivation, Today derivation, and Insights evidence rules. Browser E2E tests are not part of the current setup.
