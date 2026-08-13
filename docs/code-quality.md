# Code quality guardrails

Every check in this document runs locally with one command and again in CI. The
principle throughout is that a standard which is not enforced by a tool is a
standard that quietly stops being true.

```bash
npm run verify   # lint, format check, typecheck, tests
npm run e2e      # build, then Playwright against next start
```

CI (`.github/workflows/ci.yml`) runs the same commands in the same order, so a
green local run and a green pipeline mean the same thing. It does two things a
local `verify` does not: it takes a coverage report while running the tests, and
it builds Storybook, so a break that only shows up in a Storybook build cannot
reach `main` unnoticed.

## At a glance

| Guardrail              | Command                 | Configured in                    |
| ---------------------- | ----------------------- | -------------------------------- |
| Linting                | `npm run lint`          | `eslint.config.mjs`              |
| Formatting             | `npm run format:check`  | `.prettierrc`, `.prettierignore` |
| Types                  | `npm run typecheck`     | `tsconfig.json`                  |
| Logic tests            | `npm test`              | `vitest.config.mts`              |
| Component tests + axe  | `npm test`              | `.storybook/`, story files       |
| Journey test + axe     | `npm run e2e`           | `playwright.config.ts`, `e2e/`   |
| Coverage report        | `npm run test:coverage` | `vitest.config.mts`              |
| Continuous integration | (on push and PR)        | `.github/workflows/ci.yml`       |

---

## 1. Static analysis

### ESLint, with warnings treated as failures

`npm run lint` runs `eslint --max-warnings 0`. The flag matters more than it
looks: a warning nobody fails on is a warning nobody reads. Before this was set,
the repository had 89 lint errors that no part of the workflow surfaced.

Base configuration is `eslint-config-next` (`core-web-vitals` and `typescript`)
plus `eslint-plugin-storybook`.

### All 34 accessibility rules, as errors

`eslint-config-next` enables only 6 of the `jsx-a11y` rules, all as warnings. The
config promotes the full recommended set to errors across `app/`, `features/` and
`components/`.

This is done by spreading the rule _names_ rather than the plugin's flat config,
because `eslint-config-next` already registers the `jsx-a11y` plugin and
re-registering it throws `Cannot redefine plugin`.

Among the rules this adds: `label-has-associated-control`, `no-autofocus`,
`no-static-element-interactions`, `click-events-have-key-events`,
`interactive-supports-focus`, `anchor-is-valid` and `control-has-associated-label`.

### A client-boundary rule

A `no-restricted-syntax` selector makes `'use client'` a build failure in
`app/**/page.tsx` and `app/**/layout.tsx`:

```
Program > ExpressionStatement > Literal[value='use client']
```

A page that opts into the client bundle takes its entire subtree with it, which is
the easiest way to silently undo server rendering. The directive belongs on the
smallest interactive leaf. This costs no extra dependency.

## 2. Formatting

Prettier, with `npm run format:check` as a gate in `verify` and in CI. Formatting
arguments are the cheapest possible thing to automate away.

## 3. Types

- `strict: true`.
- `noUncheckedIndexedAccess: true`, so indexing an array or record yields
  `T | undefined` and has to be narrowed. Adopting it produced zero errors.
- `npm run typecheck` is `next typegen && tsc --noEmit`. The `typegen` step is not
  optional: `tsconfig.json` includes `.next/types/**`, so a bare `tsc` reports
  phantom errors from stale route types after a route is added or deleted.

Type assertions used to silence the compiler are treated as defects rather than
style. Use type guards, rather than assertions.

## 4. Tests

Three layers, each catching what the others structurally cannot.

| Layer     | Location                    | Environment   | Catches                                              |
| --------- | --------------------------- | ------------- | ---------------------------------------------------- |
| Logic     | `*.test.ts`, vitest `unit`  | node          | Validation rules, formatting, pure decisions         |
| Component | `*.stories.tsx` with `play` | real Chromium | Rendering, interaction, per-component a11y           |
| Journey   | `e2e/*.spec.ts`, Playwright | `next start`  | Heading order, landmarks, duplicate ids, focus moves |

### Logic: the `unit` project

Node environment, matching `{app,features}/**/*.test.ts`. The `.test.ts`
restriction is deliberate rather than incidental: if a test needs a DOM it belongs
in a story, so the file extension enforces the boundary instead of a convention
people drift from.

### Components: stories as tests

`@storybook/addon-vitest` runs every story in real Chromium. A story is already a
rendered component with typed props, so it serves as the behaviour test, the
accessibility check and the documentation at once.

Queries, `userEvent` and jest-dom matchers all come from `storybook/test`, so no
separate Testing Library or jsdom setup exists. If a standalone component render
is ever genuinely needed, `vitest-browser-react` is the route, not jsdom.

### Journeys: Playwright

One spec, run against `next start` on port 3100. Never against `next dev`: dev
mode skips CSS chunking and minification and runs React in development, so it
cannot tell you anything about what a user downloads. Port 3100 keeps it clear of
the dev server on 3000.

Playwright rather than Cypress because the Storybook test runner already brings a
real browser, and a second browser automation stack would duplicate it.

## 5. Accessibility, specifically

Accessibility is enforced at three independent points rather than one, because
each sees something the others cannot.

1. **Static**, at author time: the 34 lint rules above.
2. **Per component**, in a real browser: axe runs against every story.
   `parameters.a11y.test = "error"` is set globally in `.storybook/preview.tsx`,
   so a story added tomorrow is gated by default. The addon reads this parameter
   only from the global, meta or story level — it cannot be scoped by path — so
   the exceptions live in the story files that need them.
3. **Per page**, against production output: `@axe-core/playwright` scans every
   route listed in `e2e/a11y.spec.ts`, currently `/` and a deliberate 404. This is the only layer that sees heading order, landmark structure,
   duplicate ids and focus behaviour after a state change. Error states are in
   the list on purpose: they render least often and regress most easily.

### Pinned axe rule tags

The E2E spec pins `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` rather than using
axe's defaults. "Zero violations" only means something if the rule set is stated:
axe ships new rules in minor releases, and it has false positives. This repository
contains one. Axe's own tables allow the `aria-value*` attributes on both `meter`
and `progressbar`, yet it rejects them on React Aria's `role="meter progressbar"`
fallback list.

Any future exclusion goes in a `.disableRules([...])` call with a comment, so an
exception stays visible instead of quietly weakening the claim.

## 6. Continuous integration

One job, `.github/workflows/ci.yml`, on push to `main` and on every pull request.

```
npm ci → install chromium → lint → format:check → typecheck →
test:coverage → build-storybook → build + e2e
```

The coverage report uploads on every run and the Playwright report uploads on
failure, so a red pipeline can be diagnosed without reproducing it locally.

## 7. Conventions enforced by documentation, not tooling

Some rules cannot reasonably be automated. These live in `AGENTS.md`, which is
read by coding agents and by humans.

## 8. Deliberately not enforced, and known gaps

Stated rather than hidden, because an unstated gap is worse than a known one.

- **No coverage thresholds.** Coverage now runs in CI and uploads as an artifact,
  scoped to code written for this project. No number gates the build: a threshold
  picked before the code it measures exists only teaches people to game it.
- **No pre-commit hook.** Deliberate: it needs a dependency, slows every commit,
  and is not shared with anyone who clones the repository. CI is the enforcement
  point.
- **No bundle size budget** and no Lighthouse gate. Both would make the
  performance claims measurable rather than argued, and both are the most likely
  next additions.
- **No dependency vulnerability scanning.** `npm audit` and Dependabot are not
  configured.
- **No visual regression testing.** The Chromatic addon is installed but no
  project token is configured, so it does nothing in CI today.
