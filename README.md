# innn.it Frontend Test: Petition-Update-Formular

A petition update creation form in a permanently open modal, built for the
innn.it frontend developer test against the provided Figma design.

React 19, Next.js App Router, TypeScript, React Aria Components, CSS Modules
with SCSS. The form takes a title, the update text and an optional custom
sender, validates on the client with German messages, and stores the draft as
one object in localStorage under `petition-update-draft` when "Entwurf
speichern" is clicked, restoring it into the form the next time the modal
opens. "Abbrechen" and "Update veröffentlichen" render but do nothing, as the
brief specifies. Both bonus items are in: character counters
(with `de-DE` grouping, "0 / 10.000 Zeichen") and unit tests.

> **If your system is set to dark mode, you are not looking at the Figma
> design.** The whole UI, brand layer included, responds to
> `prefers-color-scheme: dark` as a bonus on top of the brief: text, field,
> and toggle colors all get a dark-mode pass, not just the vendored kit's
> own tokens. Switch your OS to light mode (or force it in the browser dev
> tools) to see the layout actually built against the design frame.

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
easy to get subtly wrong under time pressure. Building it from scratch would have spent
the time budget re-implementing behavior a maintained library already gets
right, with none of its test coverage. The library is headless, so it cost
nothing on the styling side either: the brand layer styles it as freely as
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
`mock.ts`, marked for deletion when a real backend exists. Restoring a draft
whose stored author is not the default flips the switch on and repopulates
the custom name, so the toggle stays an honest reflection of what is saved.

**Reopening the modal restores the last saved draft.** The brief only asks
to store the draft, but a save the user can never see again is easy to
mistake for one that didn't work, so the form seeds itself from
`localStorage` once, right after hydration. It reads through
`useSyncExternalStore` rather than a `useEffect`: `localStorage` doesn't
exist during server rendering, and that hook is React's supported way to
read a browser-only value without a hydration mismatch, returning the same
"nothing yet" result the server produced until the client has mounted, then
re-reading. The stored value is untrusted input, not a value the app
controls end to end, so `parseDraft` runs it through a runtime type guard
(`isPetitionUpdateDraft`) rather than trusting the shape: corrupted JSON, a
missing key, or a value shaped by some future draft schema all fall back to
"no draft" instead of crashing the form. The restore itself runs during
render, guarded so it fires exactly once, and it deliberately leaves
`isSaved` false: that flag means "a save just happened", not "the fields
match storage", and setting it on restore would announce a save that didn't
just occur.

**Styling is CSS Modules plus a token-level brand layer, not CSS-in-JS.** The
brief allows Tailwind or Emotion but does not require them. Runtime CSS-in-JS
forces every styled component into the client bundle, which hurts exactly the
first-visit mobile audience a petition platform serves. `app/brand.scss`
carries only what is global: font faces, the palette as custom properties.
Component-specific overrides (pill buttons, field sizing, the dialog title,
the switch, modal width) live directly in their vendored stylesheets under
`components/react-aria/`, appended after each component's own rules, rather
than in a separate global sheet reaching into the kit's classes from
outside. React Aria Components is used as a headless UI library, meant to be styled
to the consuming project's own needs, so styling it in place is the kit
working as intended rather than a deviation from it.

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

| Layer     | Where                         | What it proves                                             |
| --------- | ----------------------------- | ---------------------------------------------------------- |
| Logic     | `*.test.ts` in node           | Draft building, trimming, author choice, (de)serialization |
| Component | Stories with `play` functions | Validation UX, saving, the toggle flow, the live region    |
| Journey   | `e2e/a11y.spec.ts`            | Page-level axe scan of every route against `next start`    |

The stories run in real Chromium and assert behavior through roles and
labels: a blocked empty submit (errors visible, focus on the first invalid
field, nothing stored), a successful save (announcement plus the exact object
in localStorage), the full custom-sender flow, and that Escape, the X and a
backdrop click all leave the modal open.

Deliberately not tested, and why:

- No behavior tests for "Abbrechen" and "Update veröffentlichen", because the
  brief explicitly gives them none.
- No separate E2E journey spec. The whole journey is one form in one modal,
  which the story layer already exercises in a real browser. E2E contributes
  the page-level axe scan (heading order, landmarks, duplicate ids) that
  component-level tests structurally cannot see.

## Deliberately not built

- **Multiple drafts, timestamps, versioning.** One key, one object,
  overwritten on each save. "Store the entered data as an object" is the
  requirement; everything beyond it is scope creep.
- **Behavior for cancel and publish.** Excused by the brief.
- **An i18n framework.** The copy is hardcoded German, `lang="de"` is set,
  and number formatting follows the app-wide locale constant. One market, one
  language, no abstraction.

## Left for later

These are not scope calls; they are things I wanted to do and ran out of
time for, stated rather than left silent.

- **A code review of `petition-update.stories.tsx`.** Same gap: the play
  functions were verified by watching them pass in a real browser, not read
  back with a critical eye for redundant assertions or setup that could be
  shared.
- **A Playwright journey test that interacts with the form.**
  `e2e/a11y.spec.ts` only loads each route and scans it with axe; it never
  fills in the fields, submits, and asserts on the result. That behavior is
  covered by the story `play` functions in real Chromium, but not by an
  actual browser-navigation E2E journey, which is the layer meant to catch a
  broken real-world interaction path end to end, independent of Storybook's
  own runtime.
- **Handling the save through a BFF, with an error summary on failure.** The
  save is a pure client-side `localStorage.setItem` call today: there is no
  network request, so nothing can fail mid-flight, and the current
  validation is exhaustive by construction. A production version would
  likely route "Entwurf speichern" through a backend-for-frontend endpoint,
  and a failed response needs a real error path: the focus-managed error
  summary pattern from the original boilerplate (harvested from
  `features/super-form` before it was deleted at the start of this project)
  is what that failure state should reuse, since it exists for exactly this,
  an error the client cannot foresee, returned after a round trip.
- **Matching the toggle exactly to the Figma design.** The current switch is
  the vendored kit's component with the brand palette applied; the design's
  own track and handle proportions were approximated rather than measured.
- **Pixel-perfect font sizes and colors, particularly the counters and the
  "Absender" label.** Sized and colored close to the design frame by eye,
  not by pulling exact values from Figma. The brief asks for a layout
  approximation, not a pixel match, so this was a conscious place to stop
  rather than an oversight, but it is not pixel-perfect.
- **Whether the shade on the text inputs should stay.** The fields carry a
  light background fill that is not in the Figma frame; it reads well in
  the browser but was not checked against the design, and I am not certain
  it is the right call. Worth a second look rather than treated as settled.

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

## Time disclaimer

This ran over the roughly three-hour scope stated in the brief. My last
commit inside that window was [bd6f05a](https://github.com/a-mannered-bird/innn-it-assignment/commit/bd6f05a79497f798576c20c7655f86fa43b55749)
("chore: Added \"left for later\" section to the README"); the session log
below can be checked against it.

I was unsatisfied that the styling didn't match the Figma design closely
enough, and closing that gap needed more manual adjustment than I had
planned for. Mainly because I didn't have the rights to connect Claude to
the Figma MCP connector the way I wanted to, most of the styling was adjusted
manually rather than pulled from the design file directly.
Had I realized that sooner, I would have spent the extra time closing that
gap instead of on things like the localStorage read on open, for instance,
which was not in the brief.

## Session log

Wall-clock times, elapsed time from the start in parentheses.

| Time  | Elapsed | What                                                                                                              |
| ----- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| 10:05 | 0:00    | Reading the brief, kicking off                                                                                    |
| 10:17 | 0:15    | Defining the approach (grilling session), project setup                                                           |
| 10:40 | 0:38    | Validation and storage helpers                                                                                    |
| 11:00 | 0:58    | Building the petition form                                                                                        |
| 11:20 | 1:18    | Break                                                                                                             |
| 11:31 | 1:18    | End of break                                                                                                      |
| 11:47 | 1:34    | Styling the form                                                                                                  |
| 12:23 | 2:10    | Stories and component tests                                                                                       |
| 12:35 | 2:22    | Start writing the README                                                                                          |
| 13:10 | 2:50    | Adding the localStorage read (draft restore)                                                                      |
| 13:19 | 2:59    | Updating the README with what I didn't have time to do                                                            |
| 13:24 | 3:04    | Stealing a few minutes to adjust some style                                                                       |
| 14:02 | 3:42    | It was more than a few minutes. Final README adjustments, plus a link to the commit where the scoped time ran out |
| 14:10 | 3:50    | Last commit, verifying a fresh clone of the project works properly                                                |
