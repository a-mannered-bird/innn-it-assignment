import type { Metadata } from "next";

import { LOCALE } from "./locale";
import "@/components/react-aria/theme.scss";
import "@/components/react-aria/utilities.scss";
import "./globals.scss";
import "./brand.scss";

export const metadata: Metadata = {
  title: {
    default: "Neues Update erstellen | innn.it",
    template: "%s | innn.it",
  },
  description:
    "Erstelle ein Update zu deiner Petition und speichere es als Entwurf.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={LOCALE}>
      <body>{children}</body>
    </html>
  );
}
