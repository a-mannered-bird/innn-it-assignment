# Vendored: React Aria Components starter kit

Third-party code, not written for this project. Adobe's React Aria Components
starter kit (vanilla CSS variant), Apache-2.0. See [NOTICE](./NOTICE) for
attribution and the list of modifications, and [LICENSE](./LICENSE) for terms.

Code written for this project lives in `app/`, `features/`, and
`components/DynamicBreadcrumb.tsx`. This directory is the boundary.

## Why it is vendored rather than a dependency

The starter kit is distributed as source to be copied and owned, not as a
published package. It ships behaviour and ARIA, not design: every component is a
thin wrapper over `react-aria-components` plus a stylesheet we are meant to edit.
Vendoring it is the intended usage.

## Conventions here differ from the rest of the repo, deliberately

These components style themselves with React Aria's **default global class
names** (`.react-aria-Button`, `.react-aria-Dialog`) in **global** `.scss` files,
because that is how the kit is built. Application code does not follow this
convention: it uses CSS Modules, so styles stay scoped to the component that
owns them.

Design tokens for the whole app are defined here in `theme.scss`. It and
`utilities.scss` are imported **once**, from `app/layout.tsx`, and once more from
`.storybook/preview.tsx` because Storybook does not render the root layout.
Individual stylesheets in this directory must not import them again: doing so
duplicated the full token block into all 53 CSS chunks, roughly 700 KB of
repeated custom-property declarations.

Note the original `.css` extension: stylesheets were renamed to `.scss` in a
later commit, so a restored file needs the same rename and an updated import.
