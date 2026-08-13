import { describe, expect, it, vi } from "vitest";

import { formatCharacterCount, isBlankString } from "./string-utils";

// Hoisted above the imports by vitest, so `string-utils` builds its formatter
// from the mocked locale. Pinned to German because the expected strings
// ("10.000") are the design's, independent of what `app/locale.ts` says today.
vi.mock("@/app/locale", () => ({ LOCALE: "de" }));

describe("isBlankString", () => {
  it("treats whitespace-only input as empty", () => {
    expect(isBlankString("   ")).toBe(true);
    expect(isBlankString("\n\t")).toBe(true);
  });

  it("accepts input with any visible character", () => {
    expect(isBlankString(" a ")).toBe(false);
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
