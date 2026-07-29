# Testing

Atria currently uses Vitest for unit and integration-style domain tests.

## Commands

```bash
npm run test:run
npm run build
```

`npm run build` runs TypeScript project checks through `tsc -b` before the Vite production build.

There is no lint script in the current repository.

## Covered Areas

- calendar/date and recurrence-adjacent utilities
- intention parsing, validation, filters, and next-action derivation
- settings persistence, onboarding defaults, themes, and energy profile actions
- planning suggestion scoring and availability
- Today dashboard derivation
- reflection validation
- Memories timeline derivation
- gentle Insights evidence thresholds
- data export payload shape and filename

## Not Yet Covered

- browser E2E smoke tests
- visual regression tests
- keyboard-only interaction tests
- import/restore flow
- deployed-environment route checks

Manual release verification is tracked in [release-checklist.md](release-checklist.md).
