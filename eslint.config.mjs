// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const a11yRulesAsErrors = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [
    rule,
    "error",
  ]),
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
    "coverage/**",
    "storybook-static/**",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    files: [
      "app/**/*.{ts,tsx}",
      "features/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
    ],
    rules: a11yRulesAsErrors,
  },

  {
    files: ["app/**/page.tsx", "app/**/layout.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Program > ExpressionStatement > Literal[value='use client']",
          message:
            "'use client' does not belong on a page or layout. Move it to the smallest interactive leaf.",
        },
      ],
    },
  },

  {
    files: ["components/react-aria/**"],
    rules: {
      // These are framework-agnostic demo stories loading remote images, so
      // next/image is not applicable to them.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
