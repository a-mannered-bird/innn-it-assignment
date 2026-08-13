import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PetitionUpdateModal } from "./petition-update-modal";

const meta = {
  component: PetitionUpdateModal,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
  },
} satisfies Meta<typeof PetitionUpdateModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The brief's core constraint: the modal never closes. React Aria portals the
 * overlay to document.body, outside the story canvas, so queries go through
 * the body.
 */
export const StaysOpen: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog");

    await userEvent.keyboard("{Escape}");
    await expect(dialog).toBeInTheDocument();

    // The design's X is rendered but must not close the modal either.
    await userEvent.click(body.getByRole("button", { name: "Schließen" }));
    await expect(dialog).toBeInTheDocument();

    // A click on the overlay backdrop, outside the dialog, must not close it.
    // The dialog is centered, so the overlay's top-left corner is backdrop.
    const overlay = canvasElement.ownerDocument.querySelector(
      ".react-aria-ModalOverlay",
    );
    if (overlay instanceof HTMLElement) {
      await userEvent.pointer([
        { keys: "[MouseLeft]", target: overlay, coords: { x: 4, y: 4 } },
      ]);
    }
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
  },
};
