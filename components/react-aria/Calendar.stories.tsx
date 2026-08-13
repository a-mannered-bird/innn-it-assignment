import { Calendar } from "./Calendar";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    layout: "centered",
    a11y: {
      options: {
        rules: {
          // Artifact of rendering the component in isolation. Its month nav is
          // a bare <header>, which is only a `banner` landmark when it is not
          // inside a sectioning element — true on the story canvas, never true
          // on a page, where the calendar sits inside <main>.
          "landmark-banner-is-top-level": { enabled: false },
        },
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Calendar>;

export const Example: Story = (args) => (
  <Calendar aria-label="Event date" {...args} />
);
