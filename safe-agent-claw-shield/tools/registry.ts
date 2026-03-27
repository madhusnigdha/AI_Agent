import type { AgentTool } from "@mariozechner/pi-agent-core";
import { readFileSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

import { webSearchTool } from "./web_search.js";
import { readFileTool } from "./read_file.js";
import { writeFileTool } from "./write_file.js";
import { scanUrlTool } from "./scan_url.js";
import { codeAnalyzeTool } from "./code_analyze.js";
import { dbQueryTool } from "./db_query.js";
import { apiCallTool } from "./api_call.js";
import { summarizeTool } from "./summarize.js";

// ─── Master registry of ALL available tools ─────────────────────────────────
// Add new tools here. The active set is controlled by agent.config.json alone.
const ALL_TOOLS: Record<string, AgentTool<unknown, unknown>> = {
  web_search: webSearchTool,
  read_file: readFileTool,
  write_file: writeFileTool,
  scan_url: scanUrlTool,
  code_analyze: codeAnalyzeTool,
  db_query: dbQueryTool,
  api_call: apiCallTool,
  summarize: summarizeTool,
};

interface AgentConfig {
  domain: string;
  agentName: string;
  agentId: string;
  systemPrompt: string;
  activeTools: string[];
  policyTemplate: string;
}

// ─── Load config and return active tool subset ───────────────────────────────
export function loadActiveTools(): { config: AgentConfig; tools: AgentTool<unknown, unknown>[] } {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const configPath = resolve(join(__dirname, "..", "agent", "agent.config.json"));

  let config: AgentConfig;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8")) as AgentConfig;
  } catch (err) {
    throw new Error(`Failed to load agent.config.json from ${configPath}: ${String(err)}`);
  }

  const unknownTools = config.activeTools.filter((name) => !(name in ALL_TOOLS));
  if (unknownTools.length > 0) {
    console.warn(
      `[registry] WARNING: Unknown tools in activeTools (will be skipped): ${unknownTools.join(", ")}`,
    );
  }

  const tools = config.activeTools
    .filter((name) => name in ALL_TOOLS)
    .map((name) => ALL_TOOLS[name]);

  console.log(
    `[registry] Domain: ${config.domain} | Agent: ${config.agentName} | Tools: [${config.activeTools.join(", ")}] | Policy: ${config.policyTemplate}`,
  );

  return { config, tools };
}

export { ALL_TOOLS };
export type { AgentConfig };
