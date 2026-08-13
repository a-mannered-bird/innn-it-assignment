# innn.it Frontend Test: Petition-Update-Formular

A petition update creation form in a permanently open modal, built for the
innn.it frontend developer test against the provided Figma design.

React 19, Next.js App Router, TypeScript, React Aria Components, CSS Modules
with SCSS. The form takes a title, the update text and an optional custom
sender, validates on the client with German messages, and stores the draft as
one object in localStorage under `petition-update-draft` when "Entwurf
speichern" is clicked. "Abbrechen" and "Update veröffentlichen" render but do
nothing, as the brief specifies. Both bonus items are in: character counters
(with `de-DE` grouping, "0 / 10.000 Zeichen") and unit tests.

## Getting started

```bash
npm ci
npm run fonts   # optional, see the font note below
npm run dev
```

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Dev server on port 3000                                     |
| `npm run verify`    | Lint, format check, typecheck, all tests. Run before commit |
| `npm test`          | Logic tests in node, every story in real Chromium with axe  |
| `npm run e2e`       | Builds, then Playwright + axe against `next start`          |
| `npm run storybook` | Storybook on port 6006                                      |
| `npm run fonts`     | Downloads the brand fonts (see below)                       |

## Where this started

The first commit is my own
[nextjs-a11y-boilerplate](https://github.com/a-mannered-bird/nextjs-a11y-boilerplate),
a starter where accessibility is enforced by the toolchain rather than
asserted in prose. Every guardrail, what it catches and what is deliberately
not enforced is cataloged in
[docs/code-quality.md](docs/code-quality.md). The vendored React Aria starter
kit under `components/react-aria/` is third-party code (Apache-2.0) with its
own `NOTICE`; the boundary between it and project code is documented there.

**React Aria over hand-rolled components.** The modal, dialog, switch, text
field and their validation wiring all come from Adobe's React Aria
Components rather than plain HTML plus custom JavaScript. Those primitives
implement the WAI-ARIA authoring practices already, tested across screen
readers and browsers: the modal's focus trap and `aria-modal` behavior, the
switch's keyboard and `role` semantics, the field's `aria-invalid` and
`aria-describedby` wiring on error. That is precisely the surface that is
easy to get subtly wrong under time pressure, and accessibility is the
brief's second-highest priority. Building it from scratch would have spent
the time budget re-implementing behavior a maintained library already gets
right, with none of its test coverage. The library is headless, so it cost
nothing on the styling side either: `app/brand.scss` styles it as freely as
it would have styled plain HTML.

This repository was built with Claude Code. Every decision above was made
and reviewed deliberately: I validated each change hunk by hunk before
committing, and the accessibility findings described here were verified by
making the gates fail before making them pass.

### The font note

The brief links `expose-fonts.css`, which serves Söhne by Klim Type Foundry, a
commercially licensed typeface. This repository is public, so the font
binaries are not committed: redistributing them would violate the license.
`npm run fonts` downloads the three used weights from innn.it into
`public/fonts/` (gitignored), and without them the UI falls back to
`system-ui`. CI runs without the fonts and stays green.

## How the requirements map

| Requirement                      | Where                                                                 |
| -------------------------------- | --------------------------------------------------------------------- |
| Title input, max 100 characters  | `petition-update-form.tsx`: `maxLength` hard cap plus counter         |
| Main content textarea            | Same file, capped at 10.000 characters as in the design               |
| Author input with edit toggle    | Same file, the "Absender ändern" switch                               |
| Modal stays open, nothing closes | `petition-update-modal.tsx`: controlled `isOpen`, no `onOpenChange`   |
| Save draft + success message     | Submit handler calls `saveDraft` (`draft.ts`); `role="status"` region |
| No empty values                  | React Aria validation; "empty" includes whitespace-only input         |
| Character counters (bonus)       | `formatCharacterCount` in `lib/string-utils.ts`, locale-aware         |
| Unit tests (bonus)               | `draft.test.ts`, `string-utils.test.ts`, and story `play` functions   |

## Decisions and trade-offs

**There is no server action.** localStorage only exists in the browser, so
"save draft" is a client-side submit handler. The page itself stays a Server
Component; the modal feature is the single `'use client'` boundary. The draft
logic (`draft.ts`) is pure and takes its `Storage` as a parameter, which is
why it can be unit-tested in node without faking browser globals.

**The modal is pinned open, including Escape and the X button.** The brief
says no click outside and no button inside may close it, so the dialog is
rendered with a controlled `isOpen` and no way to change it, and the X from
the design is present but intentionally dead. To be clear: an accessible
modal should normally close on Escape and on its close button. This one is a
stated requirement, not a pattern I would ship unprompted, and the code
comments say so.

**The dialog title is the page's `h1`.** React Aria's modal makes everything
behind the overlay inert and hidden from assistive technology, so a heading
on the page behind it would be unreachable. With the dialog as the page's
only real content, its title is the document's one `h1`.

**Validation is React Aria's own, with German messages.** An inline error per
field (`aria-invalid` plus a linked message), focus moved to the first
invalid field on a blocked submit, and "empty" means blank after trimming, so
three spaces do not pass as a title. Stored values are trimmed to match what
validation accepted. The boilerplate's focus-managed error summary pattern
exists for server-returned errors after a round trip; with client validation
on three fields it would duplicate what React Aria already announces.

**The success message is a polite live region, not a focus move.** The brief
wants the message at the bottom of the modal while the form stays usable.
Nothing is replaced, and stealing focus from the button the user just clicked
would be worse than announcing. The region is always rendered so the message
appearing inside it is announced once, politely. Editing any field after a
save removes the message, because it claims the stored draft matches the
form, and after an edit that would be a lie.

**The sender model keeps the default and the custom name separate.** The
switch decides which one is live: off shows the platform sender read-only
(filled gray, as in the design), on edits the custom name, which starts empty
and is required. Toggling off never leaks a half-typed custom name into a
saved draft. The default sender is throwaway seed data and lives in
`mock.ts`, marked for deletion when a real backend exists.

**Styling is CSS Modules plus a token-level brand layer, not CSS-in-JS.** The
brief allows Tailwind or Emotion but does not require them. Runtime CSS-in-JS
forces every styled component into the client bundle, which hurts exactly the
first-visit mobile audience a petition platform serves. The brand lives in
`app/brand.scss`: font faces, the palette as custom properties, control
sizing through the kit's own tokens, and pill button styles that are opt-in
classes. Opt-in matters: the vendored kit embeds its Button inside selects,
calendars and steppers, and repainting the default variants globally broke a
vendored story's contrast gate within minutes of trying it.

**Playwright, not Cypress.** The Storybook test runner already brings a real
browser; a second automation stack would duplicate it. Cypress is listed as a
bonus in the job context, so the trade-off is documented here rather than
silently ignored.

**What the tooling caught while building, which is why it is layered:**

- axe flagged impossible contrast values on page load. Root cause: it samples
  colors while the modal's fade-in animation is still running, so text at 40%
  opacity reads as gray. The e2e config now emulates `prefers-reduced-motion`
  (a real user preference the global reset honors), which makes the scan
  deterministic instead of disabling any rule.
- The per-component axe gate caught the orange CTA at 4.27:1 against AA's
  4.5:1 for its text size, after I had hand-waved the pair as passing. The
  page-level scan had let it through; the story-level one did not.

## Testing

| Layer     | Where                         | What it proves                                          |
| --------- | ----------------------------- | ------------------------------------------------------- |
| Logic     | `*.test.ts` in node           | Draft building, trimming, author choice, serialization  |
| Component | Stories with `play` functions | Validation UX, saving, the toggle flow, the live region |
| Journey   | `e2e/a11y.spec.ts`            | Page-level axe scan of every route against `next start` |

The stories run in real Chromium and assert behavior through roles and
labels: a blocked empty submit (errors visible, focus on the first invalid
field, nothing stored), a successful save (announcement plus the exact object
in localStorage), the full custom-sender flow, and that Escape, the X and a
backdrop click all leave the modal open.

Deliberately not tested, and why:

- No test for restoring a draft, because there is no restore (next section).
- No behavior tests for "Abbrechen" and "Update veröffentlichen", because the
  brief explicitly gives them none.
- No separate E2E journey spec. The whole journey is one form in one modal,
  which the story layer already exercises in a real browser. E2E contributes
  the page-level axe scan (heading order, landmarks, duplicate ids) that
  component-level tests structurally cannot see.

## Deliberately not built

- **Draft restore on load.** The brief says store, not load. Restoring raises
  product questions (when to clear, what wins after a publish) that a test
  assignment should not answer unasked.
- **Multiple drafts, timestamps, versioning.** One key, one object,
  overwritten on each save. "Store the entered data as an object" is the
  requirement; everything beyond it is scope creep.
- **Behavior for cancel and publish.** Excused by the brief.
- **An i18n framework.** The copy is hardcoded German, `lang="de"` is set,
  and number formatting follows the app-wide locale constant. One market, one
  language, no abstraction.
- **A petition page behind the modal.** Everything behind the permanently
  open overlay is inert and invisible to assistive technology, so content
  there would be decoration nobody can reach.

## Accessibility

Enforced at three independent points, all of them build failures: all 34
`jsx-a11y` rules as lint errors, axe against every story in real Chromium,
and axe with pinned WCAG 2.1 AA tags against every route in production mode.
A keyboard-only pass covers the whole flow: tab order follows the visual
order, focus is trapped in the dialog, the switch toggles with Space, a
blocked submit moves focus to the first invalid field, and the focus ring is
visible on every stop.

Two honest caveats. The never-closing modal contradicts expected dialog
behavior by explicit requirement. And automated scans plus one keyboard pass
make the form less-barriered, not barrier-free; claims beyond that would need
testing with real assistive technology users.
