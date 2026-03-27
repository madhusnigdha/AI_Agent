/**
 * Safe Agent Gateway Setup
 *
 * Reads agent.config.json, copies the active policy template to the
 * ArmorIQ policy store, and logs the active configuration.
 *
 * This file is called by start.ts before launching the OpenClaw gateway.
 * It is the ONLY place that reads agent.config.json — all other layers
 * (ArmorClaw plugin, tool registry) consume the results automatically.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(join(__dirname, ".."));

interface AgentConfig {
  domain: string;
  agentName: string;
  agentId: string;
  systemPrompt: string;
  activeTools: string[];
  policyTemplate: string;
}

interface PolicyDefinition {
  rules: Array<{
    id: string;
    action: "allow" | "deny" | "require_approval";
    tool: string;
    dataClass?: string;
  }>;
}

interface PolicyState {
  version: number;
  updatedAt: string;
  updatedBy: string;
  policy: PolicyDefinition;
  history: unknown[];
}

export function setupGateway(): AgentConfig {
  // --- 1. Load agent.config.json ---
  const configPath = join(ROOT, "agent", "agent.config.json");
  let config: AgentConfig;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8")) as AgentConfig;
  } catch (err) {
    throw new Error(`Cannot read agent.config.json at ${configPath}: ${String(err)}`);
  }

  // --- 2. Load policy template based on policyTemplate field ---
  const templatePath = join(ROOT, "policies", "templates", `${config.policyTemplate}.json`);
  let policyDef: PolicyDefinition;
  try {
    policyDef = JSON.parse(readFileSync(templatePath, "utf-8")) as PolicyDefinition;
  } catch (err) {
    console.warn(
      `[setup] Policy template "${config.policyTemplate}" not found at ${templatePath}, falling back to "generic"`,
    );
    const genericPath = join(ROOT, "policies", "templates", "generic.json");
    policyDef = JSON.parse(readFileSync(genericPath, "utf-8")) as PolicyDefinition;
  }

  // --- 3. Write active policy to ArmorIQ policy store ---
  const policyStorePath = process.env.ARMORIQ_POLICY_STORE_PATH
    ?? join(process.env.USERPROFILE ?? process.env.HOME ?? "~", ".openclaw", "armoriq.policy.json");

  const policyState: PolicyState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: "setup.ts",
    policy: policyDef,
    history: [],
  };

  mkdirSync(dirname(policyStorePath), { recursive: true });
  writeFileSync(policyStorePath, JSON.stringify(policyState, null, 2), "utf-8");

  // --- 4. Print startup summary ---
  console.log("\n========================================");
  console.log("  Safe Agent — Claw & Shield Hackathon");
  console.log("========================================");
  console.log(`  Domain        : ${config.domain}`);
  console.log(`  Agent Name    : ${config.agentName}`);
  console.log(`  Agent ID      : ${config.agentId}`);
  console.log(`  Active Tools  : [${config.activeTools.join(", ")}]`);
  console.log(`  Policy        : ${config.policyTemplate} (${policyDef.rules.length} rules)`);
  console.log(`  Policy Store  : ${policyStorePath}`);
  console.log("========================================\n");

  return config;
}

// Allow running directly: node --import tsx gateway/setup.ts
if (process.argv[1] && fileURLToPath(import.meta.url).endsWith(process.argv[1].split("/").pop()!)) {
  setupGateway();
}
