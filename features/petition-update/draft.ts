export const DRAFT_STORAGE_KEY = "petition-update-draft";
export const TITLE_MAX_LENGTH = 100;
export const CONTENT_MAX_LENGTH = 10_000;

export type PetitionUpdateDraft = {
  title: string;
  content: string;
  author: string;
};

type DraftInput = {
  title: string;
  content: string;
  useCustomAuthor: boolean;
  customAuthor: string;
  defaultAuthor: string;
};

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
) {
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}
