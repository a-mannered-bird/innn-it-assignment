/**
 * Pure logic for the petition-update draft: what a draft is, how its values
 * are validated and formatted, and how it is persisted. Kept free of React
 * and browser globals so it runs under the node `unit` test project — the
 * caller hands in the Storage it wants written to.
 */

export const DRAFT_STORAGE_KEY = "petition-update-draft";

export const TITLE_MAX_LENGTH = 100;
export const CONTENT_MAX_LENGTH = 10_000;

export type PetitionUpdateDraft = {
  title: string;
  content: string;
  author: string;
};

/** "Cannot be empty" per the brief includes whitespace-only input: a title of
 * three spaces renders as an empty update, so it counts as empty here. */
export function isBlank(value: string): boolean {
  return value.trim() === "";
}

// The counters follow the feature's copy, which is German, hence de-DE
// grouping (the design shows "0 / 10.000 Zeichen") independent of app locale.
const characterCountFormat = new Intl.NumberFormat("de-DE");

export function formatCharacterCount(count: number, max: number): string {
  return `${characterCountFormat.format(count)} / ${characterCountFormat.format(max)} Zeichen`;
}

type DraftInput = {
  title: string;
  content: string;
  /** State of the "Absender ändern" switch at save time. */
  useCustomAuthor: boolean;
  customAuthor: string;
  defaultAuthor: string;
};

/**
 * The switch decides which author the draft carries: the platform default, or
 * the custom name — toggling the switch off must not leak a half-typed custom
 * name into a saved draft. Values are trimmed on the way in so the stored
 * object never carries padding the validation ignored.
 */
export function buildDraft({
  title,
  content,
  useCustomAuthor,
  customAuthor,
  defaultAuthor,
}: DraftInput): PetitionUpdateDraft {
  return {
    title: title.trim(),
    content: content.trim(),
    author: useCustomAuthor ? customAuthor.trim() : defaultAuthor,
  };
}

export function saveDraft(
  draft: PetitionUpdateDraft,
  storage: Pick<Storage, "setItem">,
): void {
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}
