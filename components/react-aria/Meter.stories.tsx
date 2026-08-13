import { Meter } from "./Meter";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof Meter> = {
  component: Meter,
  parameters: {
    layout: "centered",
    a11y: {
      options: {
        rules: {
          // Known axe false positive, the same one called out in
          // e2e/a11y.spec.ts: axe allows aria-value* on both `meter` and
          // `progressbar`, but rejects them on react-aria's
          // `role="meter progressbar"` fallback list. Only this rule is
          // dropped, so the story stays gated on everything else.
          "aria-allowed-attr": { enabled: false },
        },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Meter>;

export const Example: Story = (args) => <Meter {...args} />;

Example.args = {
  label: "Storage space",
  value: 80,
};
