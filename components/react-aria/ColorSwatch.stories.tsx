import { ColorSwatch } from "./ColorSwatch";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof ColorSwatch> = {
  component: ColorSwatch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorSwatch>;

export const Example: Story = (args) => <ColorSwatch {...args} />;

Example.args = {
  color: "#f00a",
};
