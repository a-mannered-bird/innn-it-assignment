import { describe, expect, it } from "vitest";
import {
  DRAFT_STORAGE_KEY,
  buildDraft,
  formatCharacterCount,
  isBlank,
  saveDraft,
} from "./draft";

describe("isBlank", () => {
  it("treats whitespace-only input as empty", () => {
    expect(isBlank("   ")).toBe(true);
    expect(isBlank("\n\t")).toBe(true);
  });

  it("accepts input with any visible character", () => {
    expect(isBlank(" a ")).toBe(false);
  });
});

describe("formatCharacterCount", () => {
  it("formats the count against its maximum", () => {
    expect(formatCharacterCount(0, 100)).toBe("0 / 100 Zeichen");
  });

  it("groups thousands the German way, as in the design", () => {
    expect(formatCharacterCount(1355, 10_000)).toBe("1.355 / 10.000 Zeichen");
  });
});

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

    const draft = { title: "Titel", content: "Text", author: "Anna" };
    saveDraft(draft, storage);

    const stored = written.get(DRAFT_STORAGE_KEY);
    expect(stored).toBeDefined();
    expect(JSON.parse(stored ?? "")).toEqual(draft);
  });
});
