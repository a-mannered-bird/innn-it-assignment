import path from "node:path";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      // lcov for tooling, text for the CI log, html for the uploaded artifact.
      reporter: ["text", "html", "lcov"],
      // Coverage is a signal about code written for this project, so the
      // vendored kit and files with no logic to exercise are left out.
      include: ["app/**", "features/**", "components/**"],
      exclude: [
        "components/react-aria/**",
        "**/*.stories.tsx",
        "**/*.d.ts",
        "app/**/layout.tsx",
      ],
    },
    projects: [
      {
        // Logic only: validation rules, formatters, anything decidable without a
        // DOM. Component behaviour belongs in a story, which runs in a real
        // browser with axe, so `.test.ts` here is deliberate and `.test.tsx` is
        // not matched.
        test: {
          name: "unit",
          environment: "node",
          include: ["{app,features}/**/*.test.ts"],
        },
        // Mirrors the `@/*` path in tsconfig.json; the storybook project gets
        // it from the Next.js plugin, plain node needs it spelled out.
        resolve: {
          alias: { "@": import.meta.dirname },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
