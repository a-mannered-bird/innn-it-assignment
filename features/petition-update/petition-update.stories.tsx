import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PetitionUpdateForm } from "./petition-update-form";
import { DRAFT_STORAGE_KEY } from "./draft";
import { DEFAULT_AUTHOR } from "./mock";

const meta = {
  component: PetitionUpdateForm,
  parameters: {
    layout: "padded",
    // Explicit, even though the preview default already errors: our own
    // stories must never drift back to report-only.
    a11y: { test: "error" },
  },
  // Stories share one browser context, so every play starts from a clean
  // draft slate instead of inheriting the previous story's save.
  beforeEach: () => {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  },
} satisfies Meta<typeof PetitionUpdateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptySubmitShowsErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Entwurf speichern" }),
    );

    await waitFor(() =>
      expect(canvas.getByText("Bitte gib einen Titel ein.")).toBeVisible(),
    );
    await expect(
      canvas.getByText("Bitte schreibe einen Text für dein Update."),
    ).toBeVisible();

    // React Aria moves focus to the first invalid field on a blocked submit.
    await expect(canvas.getByRole("textbox", { name: "Titel" })).toHaveFocus();

    // A rejected submit must not persist anything.
    await expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  },
};

export const SavesDraftToLocalStorage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole("textbox", { name: "Titel" }),
      "Wir haben 50.000 Unterschriften!",
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Deine Neuigkeiten" }),
      "Danke an alle, die unterschrieben haben.",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Entwurf speichern" }),
    );

    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Dein Entwurf wurde gespeichert.",
      ),
    );

    const stored = JSON.parse(
      window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "null",
    );
    await expect(stored).toEqual({
      title: "Wir haben 50.000 Unterschriften!",
      content: "Danke an alle, die unterschrieben haben.",
      author: DEFAULT_AUTHOR,
    });
  },
};

export const CustomAuthorFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Off by default: the field shows the locked platform sender.
    const lockedAuthor = canvas.getByRole("textbox", { name: "Absender" });
    await expect(lockedAuthor).toHaveValue(DEFAULT_AUTHOR);
    await expect(lockedAuthor).toHaveAttribute("readonly");

    await userEvent.click(
      canvas.getByRole("switch", { name: "Absender ändern" }),
    );

    // On: the custom name starts empty and is editable and required.
    const author = canvas.getByRole("textbox", { name: "Absender" });
    await expect(author).toHaveValue("");
    await expect(author).not.toHaveAttribute("readonly");

    await userEvent.type(
      canvas.getByRole("textbox", { name: "Titel" }),
      "Zwischenstand",
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Deine Neuigkeiten" }),
      "Ein kurzes Update.",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Entwurf speichern" }),
    );

    // An empty custom name blocks the save.
    await waitFor(() =>
      expect(canvas.getByText("Bitte gib einen Absender an.")).toBeVisible(),
    );
    await expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();

    await userEvent.type(author, "Anna Beispiel");
    await userEvent.click(
      canvas.getByRole("button", { name: "Entwurf speichern" }),
    );

    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Dein Entwurf wurde gespeichert.",
      ),
    );
    const stored = JSON.parse(
      window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "null",
    );
    await expect(stored?.author).toBe("Anna Beispiel");
  },
};

export const EditingRevokesSavedMessage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole("textbox", { name: "Titel" }),
      "Titel",
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Deine Neuigkeiten" }),
      "Text",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Entwurf speichern" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Dein Entwurf wurde gespeichert.",
      ),
    );

    // The message claims the stored draft matches the form; the moment the
    // form changes again, that claim would be stale, so it must disappear.
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Titel" }),
      " geändert",
    );
    await expect(
      canvas.queryByText("Dein Entwurf wurde gespeichert."),
    ).not.toBeInTheDocument();
  },
};
