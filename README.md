# nextjs-a11y-boilerplate

A Next.js App Router starting point where accessibility is enforced by the
toolchain rather than asserted in prose.

Next.js, React, TypeScript, CSS Modules with SCSS, and
[React Aria Components](https://react-spectrum.adobe.com/react-aria/) for the
interactive primitives.

## Getting started

```bash
npm install
npm run dev
```

| Command                 | What it does                                                |
| ----------------------- | ----------------------------------------------------------- |
| `npm run verify`        | lint, format check, typecheck, tests. Run before commits.   |
| `npm test`              | Every story in real Chromium with axe, plus any logic tests |
| `npm run test:coverage` | `npm test` with a V8 coverage report over our own code      |
| `npm run e2e`           | Builds, then runs Playwright against `next start`           |
| `npm run storybook`     | Storybook on port 6006                                      |
| `npm run typecheck`     | `next typegen && tsc --noEmit`                              |

CI (`.github/workflows/ci.yml`) runs the same commands, takes coverage while it
runs the tests, and additionally builds Storybook so a Storybook-only break
cannot ship green.

**[docs/code-quality.md](docs/code-quality.md)** catalogues every guardrail in the
repository, what each one catches, where it is configured, and what is
deliberately left unenforced.

## How accessibility is enforced

Three independent layers, because each catches what the others cannot.

**Static analysis.** All 34 `jsx-a11y` rules run as errors, not warnings, and
`npm run lint` uses `--max-warnings 0`. The default Next.js config enables only 6
of them, all as warnings, which is why this is configured explicitly. A second
rule makes `'use client'` on a page or layout a build failure, so the client
boundary cannot quietly creep upwards.

**Per component.** Every story runs in real Chromium via the Storybook Vitest
addon with axe attached. `a11y.test = "error"` is set globally, so a new story is
gated without anyone remembering to opt in.

**Per page.** One Playwright spec runs axe over every route in its list —
currently `/` and a deliberate 404. This is the only layer that sees
heading order, landmark structure, duplicate ids and focus behaviour after a
state change. Adding a route to the list adds it to the scan.

Both axe layers were verified by deliberately introducing a violation and
confirming the suite went red, rather than by trusting a passing run.

### Decisions worth explaining

## Structure

```
app/                     routes, layouts, global styles
features/                application components, colocated with their styles and tests
components/react-aria/   vendored: Adobe's React Aria starter kit (Apache-2.0)
e2e/                     Playwright specs
```

`components/react-aria/` is third-party source, not code written for this project.
It carries its own `README.md`, `NOTICE` and `LICENSE`, and the `NOTICE` lists
every modification made to it, as Apache-2.0 requires. Keeping it in one clearly
labelled directory means a reviewer can tell at a glance which code is ours.

## Styling

CSS Modules with SCSS for our components, plus CSS custom properties for tokens.

No runtime CSS-in-JS: it forces every styled component into the client bundle and
adds work on exactly the low-end mobile devices where there is least headroom.
CSS Modules work in Server Components, so pages stay server-rendered and only
interactive leaves ship JavaScript.

The vendored kit keeps its own convention of global stylesheets keyed on React
Aria's class names, because that is how it is built. Rather than rewrite 56
components, the boundary is documented: global there, scoped here.

## Testing

| Layer     | Location                    | Environment   |
| --------- | --------------------------- | ------------- |
| Logic     | `*.test.ts`, vitest `unit`  | node          |
| Component | `*.stories.tsx` with `play` | real Chromium |
| Journey   | `e2e/*.spec.ts`, Playwright | `next start`  |

Component behaviour is tested as stories rather than as separate test files. A
story is already a rendered component with typed props, so it serves as the
behaviour test, the accessibility check and the documentation at once. Queries,
`userEvent` and jest-dom matchers all come from `storybook/test`, so no separate
Testing Library or jsdom setup is needed.

E2E runs against `next start`, never `next dev`. Dev mode skips CSS chunking and
minification and runs React in development, so it cannot tell you anything about
what a user downloads.

Playwright rather than Cypress: the Storybook test runner already brings a real
browser, and adding a second browser automation stack to do a job the first one is
already doing is duplication.

## Deliberately not done

- **`cacheComponents` and Partial Prerendering.** This is where caching a page
  shell while streaming live data belongs, and it is the right answer for a page
  whose content is stable but whose counters are not. It is left out because
  adopting a new caching model is a larger change than a boilerplate should carry
  by default.
- **Structured data.** schema.org has no type that fits every page, and a wrong
  type is worse than none, so it is left to whatever is built on top of this.
- **Coverage thresholds.** Coverage is measured and published as a CI artifact,
  but no number gates the build. A threshold picked arbitrarily is worse than
  none; set one once the code it measures is real.

## Tooling note

This repository was set up with Claude Code. Every decision above was
made deliberately and verified by running it: the accessibility gates were tested
by making them fail, the CSS reduction was measured before and after, and the
focus behaviour was checked in a browser rather than assumed.
