import type { Preview } from "@storybook/nextjs-vite";

// The root layout is not rendered here, so the global stylesheets it loads have
// to be imported explicitly or every story renders untokenised.
import "../components/react-aria/theme.scss";
import "../components/react-aria/utilities.scss";
import "../app/globals.scss";
import "../app/brand.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "error",
    },
  },
};

export default preview;
