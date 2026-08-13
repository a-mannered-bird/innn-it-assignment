<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!--
  Everything below is hand-written. The block above is managed by `next dev`,
  which rewrites only the text between its markers, so content out here is safe.
-->

# Conventions

Next.js App Router, React 19, TypeScript. Run `npm run verify` before any commit.

## Directory boundaries

- `components/react-aria/` is **vendored** third-party code (Adobe's React Aria
  starter kit, Apache-2.0). Do not put project code there, and read its
  `README.md` and `NOTICE` before editing anything in it.
- `app/` and `features/` are ours. Files at the root of the `components/` folder (like`components/DynamicBreadcrumb.tsx`) are ours too.

## Server and client

- Server Components by default. `'use client'` belongs on the smallest leaf that
  needs state, effects, handlers or browser APIs.
- `'use client'` on a page or layout is a lint error, enforced by a
  `no-restricted-syntax` rule in `eslint.config.mjs`.
- Every `react-aria-components` module imports `client-only`, so anything built
  on the kit is a Client Component. Use plain HTML for static content: headings
  in `app/` are `<h1>`/`<h2>`, not the kit's `Heading`.
- The one exception is a dialog title, which must be the kit's `Heading` with
  `slot="title"` because that is what `Dialog` uses for its `aria-labelledby`.

## Types

Type assertions used to silence the compiler are treated as defects rather than
style. Use type guards, rather than assertions.

An assertion only silences the compiler, while a guard performs a real runtime
check, so an assertion that turns out to be wrong fails later and further away
from its cause. Discriminate on a property unique to the target type, and when a
value may be absent, narrow and fall back rather than asserting it away.

## Styling

Two tiers, deliberately:

- **Vendored:** global `.scss` files keyed on React Aria's own class names
  (`.react-aria-Button`). That is how the kit is built.
- **Ours:** CSS Modules (`Component.module.scss`), so styles stay scoped to the
  component that owns them.

Design tokens live in `components/react-aria/theme.scss` and are imported **once**
in `app/layout.tsx`, plus once in `.storybook/preview.tsx` because Storybook does
not render the root layout. Never re-import them from a component stylesheet to avoid duplication.

Base styles, the reset, and utilities like `:focus-visible`, `prefers-reduced-motion` and
`.visually-hidden` are global, in `app/globals.scss`.

## Accessibility

Treat these as build failures, because they are.

- All 34 `jsx-a11y` rules run as **errors** across `app/`, `features/` and
  `components/`. `npm run lint` uses `--max-warnings 0`.
- Every input needs a real `<label>`. Placeholders are not labels.
- Errors: `aria-invalid` on the field plus `aria-describedby` pointing at the
  message. Never colour alone.
- Move focus on state changes: to the error summary heading on a failed submit,
  to the confirmation when a form is replaced.
- Do not combine a live region with a focus move on the same element. It is a
  documented cause of double announcements. Pick one; we focus.
- `aria-labelledby` is prohibited on a bare `<div>` (role `generic`). Focus a
  heading instead, or give the container a real role.
- One `<h1>`, no skipped levels.
- Verify any ARIA against MDN or the ARIA Authoring Practices Guide. Do not add
  ARIA that a native element provides for free.

## Testing

Three layers, each with a different job:

| Layer     | Where                        | Runs in       |
| --------- | ---------------------------- | ------------- |
| Logic     | `*.test.ts` (vitest `unit`)  | node          |
| Component | `*.stories.tsx` + `play`     | real Chromium |
| Journey   | `e2e/*.spec.ts` (Playwright) | `next start`  |

- `.test.ts` only, never `.test.tsx`: if it needs a DOM it belongs in a story.
  `@testing-library/react` and `jsdom` are deliberately not installed. Queries,
  `userEvent` and jest-dom matchers all come from `storybook/test`. If you ever
  genuinely need a standalone component render, add `vitest-browser-react` rather
  than reintroducing jsdom.
- A `play` function can submit a form: `@storybook/nextjs-vite` executes server
  actions, so `useActionState` resolves and the result renders. Allow for the
  action's own latency when awaiting the outcome.
- Set `parameters.a11y.test = "error"` in our own story files. Vendored stories
  stay on the global `"todo"` so their violations are reported without gating our
  build on third-party code.
- E2E asserts against `next start` on port 3100, never `next dev`, and pins its
  axe rule tags. If a rule must be excluded, use `.disableRules([...])` with a
  comment, so the exception stays visible.

## Gotchas

- `npm run typecheck` is `next typegen && tsc --noEmit`. The `typegen` step is not
  optional: `tsconfig.json` includes `.next/types/**`, so a bare `tsc` reports
  phantom errors from stale route types after you add or delete a route.

## Things we deliberately do not do

- Abstractions with one call site. A generic `<Field>` system for four fields is
  harder to read than four fields.
- Custom hooks with a single call site, for the same reason.
- State machines for simple form state. `useActionState` and a boolean cover it.
- Barrel files (`index.ts` re-exports).
- `any`. Assertions are covered under Types above.
- New dependencies without discussion. Ask first.
- `useEffect` where a derived value or an event handler would do. A timer callback
  is already an event handler, not a reason for a second effect.
- Refactoring working code because it could be cleaner. Leave it, or raise it.
- Comments that restate the code. Comments explain why, or do not exist.
