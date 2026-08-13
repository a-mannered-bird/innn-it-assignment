/**
 * Downloads the innn.it brand fonts for local development.
 *
 * The files are Söhne by Klim Type Foundry — commercially licensed, so they
 * are gitignored rather than committed: this repository is public and
 * redistributing the binaries would violate the license. Without them the UI
 * falls back to system-ui and everything still works.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = "https://innn.it/fonts";
const TARGET = path.join(import.meta.dirname, "..", "public", "fonts");

const FILES = [
  "soehne-buch.woff2",
  "soehne-kraftig.woff2",
  "soehne-dreiviertelfett.woff2",
];

await mkdir(TARGET, { recursive: true });

for (const file of FILES) {
  const response = await fetch(`${SOURCE}/${file}`);
  if (!response.ok) {
    throw new Error(`${file}: ${response.status} ${response.statusText}`);
  }
  await writeFile(
    path.join(TARGET, file),
    Buffer.from(await response.arrayBuffer()),
  );
  console.log(`fetched ${file}`);
}
