import { Checkbox } from "./Checkbox";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Checkbox>;

export const Example: Story = (args) => (
  <Checkbox {...args}>Unsubscribe</Checkbox>
);
