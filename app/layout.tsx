import type { Metadata } from "next";

import { LOCALE } from "./locale";
import "@/components/react-aria/theme.scss";
import "@/components/react-aria/utilities.scss";
import "./globals.scss";

export const metadata: Metadata = {
  title: {
    default: "Next.js accessibility boilerplate",
    template: "%s | Next.js accessibility boilerplate",
  },
  description:
    "A Next.js starter wired for accessibility: React Aria Components, " +
    "axe-checked stories, and an end-to-end WCAG scan in CI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={LOCALE}>
      <body>{children}</body>
    </html>
  );
}
