import { RangeCalendar } from "./RangeCalendar";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof RangeCalendar> = {
  component: RangeCalendar,
  parameters: {
    layout: "centered",
    a11y: {
      options: {
        rules: {
          // Same isolation artifact as Calendar: the month nav is a bare
          // <header>, a `banner` landmark only outside a sectioning element.
          "landmark-banner-is-top-level": { enabled: false },
        },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof RangeCalendar>;

export const Example: Story = (args) => (
  <RangeCalendar aria-label="Trip dates" {...args} />
);
