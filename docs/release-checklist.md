# Atria Release Checklist

Status: release candidate `1.0.0-rc.1`

## Product

- [x] Core app routes exist and lazy-load.
- [x] Unknown routes render a Not Found page.
- [x] First-run onboarding is available and skippable.
- [x] Onboarding can be reopened from Settings.
- [x] Sample data can be loaded from Settings.
- [x] Command palette includes primary routes and creation commands.
- [ ] Full manual route walkthrough completed in deployed environment.

## Data

- [x] Stored settings normalize onboarding and theme defaults.
- [x] Export creates a local JSON backup from normalized source stores.
- [x] Clear-data controls require confirmation.
- [x] Storage read/write failures do not crash the app.
- [x] Demo loading replaces current sample-relevant data rather than duplicating records.
- [x] Import flow implemented.
- [ ] Malformed LocalStorage manually tested in browser.

## Quality

- [x] `npm run test:run` passes.
- [x] `npm run build` passes.
- [x] No lint script exists in the repository.
- [x] Production bundle reviewed from Vite output.
- [ ] Console manually verified clean across all routes.

## Accessibility

- [x] Skip link added.
- [x] Workspace pages use a stable main content target.
- [x] Modal Escape handling and focus restoration improved.
- [x] Command palette shortcut ignores editable fields.
- [x] Toasts use status semantics.
- [ ] Full keyboard-only manual audit completed.
- [ ] Screen reader pass completed.

## Responsive

- [x] Calendar retains intentional horizontal scrolling.
- [x] Modal and onboarding layouts have mobile constraints.
- [x] Header overlap and title clipping issues fixed.
- [ ] 320px, 375px, 768px, 1024px, and 1440px manual pass completed.

## Release

- [x] README updated.
- [x] Architecture documentation updated.
- [x] Changelog added.
- [x] Vercel SPA rewrite exists.
- [x] Version set to `1.0.0-rc.1`.
- [ ] Screenshots captured.
- [ ] Git tag prepared.
- [ ] Deployment verified after this release candidate.
