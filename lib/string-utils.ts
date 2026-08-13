import { LOCALE } from "@/app/locale";

export function isBlankString(value: string): boolean {
  return value.trim() === "";
}

const characterCountFormat = new Intl.NumberFormat(LOCALE);

export function formatCharacterCount(count: number, max: number): string {
  return `${characterCountFormat.format(count)} / ${characterCountFormat.format(max)} Zeichen`;
}
