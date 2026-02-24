#!/usr/bin/env node
/**
 * validate-config.mjs — opencode.json integrity checker
 *
 * Strips JSON5-style line comments (// ...) before parsing, then verifies
 * that every agent entry has the three required fields: model, mode, prompt.
 *
 * Usage:
 *   node validate-config.mjs              # validates opencode.json in CWD
 *   node validate-config.mjs path/to/opencode.json
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const REQUIRED_AGENT_FIELDS = ["model", "mode", "prompt"];

const configPath = resolve(process.argv[2] ?? "opencode.json");

let raw;
try {
  raw = readFileSync(configPath, "utf8");
} catch (err) {
  console.error(`ERROR: Cannot read ${configPath}: ${err.message}`);
  process.exit(1);
}

// Strip single-line comments so standard JSON.parse can handle JSON5-style config.
// Skips occurrences of // that appear inside string literals by processing
// the file character-by-character.
function stripLineComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    // Inside a string literal — copy verbatim until the closing quote.
    if (src[i] === '"') {
      out += src[i++];
      while (i < src.length) {
        if (src[i] === "\\" && i + 1 < src.length) {
          out += src[i++]; // escape prefix
          out += src[i++]; // escaped char
        } else if (src[i] === '"') {
          out += src[i++];
          break;
        } else {
          out += src[i++];
        }
      }
    // Line comment — skip to end of line.
    } else if (src[i] === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else {
      out += src[i++];
    }
  }
  return out;
}

const stripped = stripLineComments(raw);

let config;
try {
  config = JSON.parse(stripped);
} catch (err) {
  console.error(`ERROR: JSON parse failed — ${err.message}`);
  process.exit(1);
}

const agents = config?.agent ?? {};
const missing = [];

for (const [name, def] of Object.entries(agents)) {
  for (const field of REQUIRED_AGENT_FIELDS) {
    if (!def[field]) {
      missing.push(`  agent "${name}" is missing required field: "${field}"`);
    }
  }
}

if (missing.length > 0) {
  console.error("ERROR: Validation failed:\n" + missing.join("\n"));
  process.exit(1);
}

const agentCount = Object.keys(agents).length;
console.log(
  `ok — ${configPath} parsed successfully (${agentCount} agent${agentCount !== 1 ? "s" : ""} validated)`
);
