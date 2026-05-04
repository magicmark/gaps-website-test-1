#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const gapsDir = join(rootDir, "gaps");

function getGapDirs() {
  return readdirSync(gapsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^GAP-[1-9]\d*$/.test(d.name))
    .sort((a, b) => {
      const numA = parseInt(a.name.slice(4), 10);
      const numB = parseInt(b.name.slice(4), 10);
      return numA - numB;
    });
}

function main() {
  const lines = [];

  for (const dir of getGapDirs()) {
    const metadataPath = join(gapsDir, dir.name, "metadata.yml");
    const metadata = parseYaml(readFileSync(metadataPath, "utf8"));

    const owners = metadata.authors.map((a) => a.githubUsername.replace(/^@/, ""));
    const ownerList = owners.map((o) => `@${o}`).join(" ");
    lines.push(`/gaps/${dir.name}/ ${ownerList}`);
  }

  const content = lines.length > 0 ? lines.join("\n") + "\n" : "";
  const codeownersPath = join(rootDir, "CODEOWNERS");

  const existing = readFileSync(codeownersPath, "utf8").toString();
  if (existing === content) {
    console.log("CODEOWNERS is up to date.");
    process.exit(0);
  }

  writeFileSync(codeownersPath, content);
  console.log("CODEOWNERS updated.");
}

main();
