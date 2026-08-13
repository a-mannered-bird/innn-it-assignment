import { describe, expect, it } from "vitest";
import { DRAFT_STORAGE_KEY, buildDraft, loadDraft, saveDraft } from "./draft";

describe("buildDraft", () => {
  const input = {
    title: "  Wir haben 50.000 Unterschriften!  ",
    content: "Danke an alle.\n",
    customAuthor: " Anna ",
    defaultAuthor: "Petra Petitionsstarterin",
  };

  it("uses the custom author when the switch is on", () => {
    const draft = buildDraft({ ...input, useCustomAuthor: true });
    expect(draft.author).toBe("Anna");
  });

  it("falls back to the default author when the switch is off, even if a custom name was typed", () => {
    const draft = buildDraft({ ...input, useCustomAuthor: false });
    expect(draft.author).toBe("Petra Petitionsstarterin");
  });

  it("trims title and content so the stored draft matches what validation accepted", () => {
    const draft = buildDraft({ ...input, useCustomAuthor: false });
    expect(draft.title).toBe("Wir haben 50.000 Unterschriften!");
    expect(draft.content).toBe("Danke an alle.");
  });
});

describe("saveDraft", () => {
  it("stores the draft as one JSON object under the draft key", () => {
    const written = new Map<string, string>();
    const storage = {
      setItem: (key: string, value: string) => written.set(key, value),
    };

    const notStoredYet = written.get(DRAFT_STORAGE_KEY);
    expect(notStoredYet).toBeUndefined();

    const draft = { title: "Titel", content: "Text", author: "Anna" };
    saveDraft(draft, storage);

    const stored = written.get(DRAFT_STORAGE_KEY);
    expect(stored).toBeDefined();
    expect(JSON.parse(stored ?? "")).toEqual(draft);
  });
});

describe("loadDraft", () => {
  function storageOf(value: string | undefined) {
    return { getItem: (key: string) => (key === DRAFT_STORAGE_KEY ? (value ?? null) : null) };
  }

  it("returns null when nothing is stored", () => {
    expect(loadDraft(storageOf(undefined))).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(loadDraft(storageOf("{not json"))).toBeNull();
  });

  it("returns null when the stored shape doesn't match a draft", () => {
    expect(loadDraft(storageOf(JSON.stringify({ title: "Titel" })))).toBeNull();
  });

  it("returns the draft when it matches the expected shape", () => {
    const draft = { title: "Titel", content: "Text", author: "Anna" };
    expect(loadDraft(storageOf(JSON.stringify(draft)))).toEqual(draft);
  });
});
