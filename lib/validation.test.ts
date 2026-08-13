import { describe, expect, it } from "vitest";
import { requireVisibleText } from "./validation";

describe("requireVisibleText", () => {
  const validate = requireVisibleText("Bitte ausfüllen.");

  it("returns the message for empty and whitespace-only input", () => {
    expect(validate("")).toBe("Bitte ausfüllen.");
    expect(validate(" \n\t ")).toBe("Bitte ausfüllen.");
  });

  it("passes input with any visible character", () => {
    expect(validate(" a ")).toBeNull();
  });
});
