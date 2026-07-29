# Changelog

## 1.0.0-rc.1 - 2026-07-29

### Added

- First-run onboarding for the app workspace.
- Selectable themes: Soft Rose Glass, Violet Dusk, Blue Hour, and Ember Noir.
- Local JSON export for calendar, intentions, reflections, goals, projects, and settings.
- Settings controls for sample data, export, onboarding reopen, and destructive data clearing.
- Not Found page for unknown routes.
- Global render error boundary with calm recovery copy.
- Release checklist and refreshed architecture documentation.

### Improved

- Main app shell, sidebar, calendar header, and contextual calendar rail.
- Event card sizing to reduce overlap in short calendar slots.
- Large title spacing and header layout to prevent clipping and toolbar overlap.
- Modal Escape handling and focus restoration.
- Command palette route consistency and sample-data wording.
- LocalStorage failure handling and development diagnostics.
- Product copy around Atria as a calm calendar for shaping, understanding, and remembering time.

### Fixed

- Awkward day-summary capsule alignment.
- Cropped page titles in large hero/header containers.
- Header controls overlapping long calendar date titles.
- Duplicate Projects command in the command palette.

### Known Limitations

- Import from backup is not implemented yet.
- Data is browser-local only with no cross-device sync.
- Recurring item editing and deletion apply to the whole series.
- Memories are derived from current source records rather than immutable snapshots.
- Insights are deterministic heuristics, not AI analysis.
- Full manual deployed-browser QA remains to be completed before a final `1.0.0`.
