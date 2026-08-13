import { Tooltip, TooltipTrigger } from "./Tooltip";
import { Button } from "./Button";
import { Save } from "lucide-react";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof Tooltip>;

export const Example: Story = (args) => (
  <TooltipTrigger>
    <Button aria-label="Save">
      <Save size={18} />
    </Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);
