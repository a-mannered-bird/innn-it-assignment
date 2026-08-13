import { NumberField } from "./NumberField";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof NumberField>;

export const Example: Story = (args) => <NumberField {...args} />;

Example.args = {
  label: "Cookies",
  placeholder: "-",
};
