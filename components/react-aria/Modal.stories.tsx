import { Modal } from "./Modal";
import { Dialog, DialogTrigger } from "./Dialog";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { Heading } from "./Content";
import type { Meta, StoryFn } from "@storybook/nextjs-vite";

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Modal>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Modal {...args}>
      <Dialog>
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField
            // Modal dialog opened by user action, not a page load. The APG dialog
            // pattern sets initial focus on the first input when the dialog is
            // short and form-like, so this is the prescribed behaviour rather than
            // the unprompted focus move the rule guards against.
            // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            label="First Name"
            placeholder="Enter your first name"
          />
          <TextField label="Last Name" placeholder="Enter your last name" />
          <Button slot="close">Submit</Button>
        </form>
      </Dialog>
    </Modal>
  </DialogTrigger>
);
