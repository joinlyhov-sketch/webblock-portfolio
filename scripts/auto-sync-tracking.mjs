import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const TRACKING_FILE = "API_TRACKING.md";
const FEATURES_DIR = "src/features";

function getWiredEndpoints(dir) {
  const wired = new Set();
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        getWiredEndpoints(fullPath).forEach(ep => wired.add(ep));
      } else if (entry === "api.ts") {
        const content = readFileSync(fullPath, "utf-8");
        if (/from\s+['"].*\/mocks\/.*['"]/.test(content)) continue;

        const matches = content.matchAll(/apiClient(?:<[^>]+>)?\(\s*[`'"](?:\/api\/backend)?([^`'"]+)[`'"]/g);
        for (const match of matches) {
          const normalized = match[1].replace(/\$\{[^}]+\}/g, (m) => `{${m.slice(2, -1)}}`);
          wired.add(normalized);
        }
      }
    }
  } catch (e) {}
  return wired;
}

const activeEndpoints = getWiredEndpoints(FEATURES_DIR);
try {
  let trackingContent = readFileSync(TRACKING_FILE, "utf-8");
  let updatedCount = 0;

  const lines = trackingContent.split("\n");
  const updatedLines = lines.map(line => {
    if (!line.startsWith("|") || line.includes("Endpoint") || line.includes(":---")) return line;

    const parts = line.split("|").map(p => p.trim());
    const endpoint = parts[1];
    const status = parts[4];

    if (endpoint && activeEndpoints.has(endpoint) && status.includes("[ ] Pending")) {
      updatedCount++;
      return line.replace("[ ] Pending", "[x] Verified");
    }
    return line;
  });

  if (updatedCount > 0) {
    try {
      execSync("pnpm verify:quick", { stdio: "ignore" });
      writeFileSync(TRACKING_FILE, updatedLines.join("\n"));
      console.log(`\n✨ [Auto-Sync] Detected & verified ${updatedCount} endpoint(s) in API_TRACKING.md.`);
    } catch (err) {
      console.warn(`\n⚠️ [Auto-Sync] Endpoints detected, but typecheck/invariants failed. Leaving as [ ] Pending.`);
    }
  }
} catch (e) {}
