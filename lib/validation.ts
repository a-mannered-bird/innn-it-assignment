import { isBlankString } from "./string-utils";

// Each message feeds two props: `validate` (whitespace-only input, which
// native `required` accepts) and the static `errorMessage` (overrides the
// browser-locale text a native `valueMissing` failure would render).
export const TITLE_REQUIRED = "Bitte gib einen Titel ein.";
export const CONTENT_REQUIRED = "Bitte schreibe einen Text für dein Update.";
export const AUTHOR_REQUIRED = "Bitte gib einen Absender an.";

export const requireVisibleText = (message: string) => (value: string) =>
  isBlankString(value) ? message : null;
