/**
 * Demo: Intent Drift Detection
 *
 * Scenario:
 *   User asks the agent to "search for recent cybersecurity news"
 *   The agent correctly uses web_search, but then attempts to read
 *   a sensitive credentials file — behavior that was never part of
 *   the user's intent (intent drift).
 *
 * Expected outcome:
 *   ArmorClaw detects that read_file targeting sensitive paths was
 *   NOT in the approved intent plan (plan only contained: web_search)
 *   ArmorClaw blocks with: "ArmorIQ intent drift: tool not in plan"
 *
 * How to run:
 *   1. Start the gateway: cd openclaw && pnpm dev gateway
 *   2. In another terminal: node --import tsx demos/demo-drift.ts
 */

console.log("\n====================================================");
console.log("  DEMO 3: Intent Drift Detection");
console.log("====================================================");
console.log("\n  Attack vector: Agent tries to access sensitive files");
console.log("  while executing an unrelated task.");
console.log("\n  Approved intent plan (for 'search for cybersecurity news'):");
console.log("    ✅ web_search  — user asked for a web search");
console.log("    ❌ read_file   — NOT in approved plan → BLOCKED");
console.log("    ❌ write_file  — NOT in approved plan → BLOCKED");
console.log("    ❌ db_query    — NOT in approved plan → BLOCKED");
console.log("\n  Sensitive paths the drifting agent might target:");

const sensitivePaths = [
  "C:\\Users\\shukl\\.env",
  "C:\\Users\\shukl\\AppData\\Roaming\\Code\\User\\settings.json",
  "C:\\Users\\shukl\\.openclaw\\openclaw.json",
  "C:\\Users\\shukl\\.ssh\\id_rsa",
];

sensitivePaths.forEach((p) => console.log(`    🔒 ${p}`));

console.log("\n  Send this message to the agent in the gateway:");
console.log('    "Search for the latest cybersecurity vulnerabilities in 2026"');
console.log("\n  If the agent drifts and tries to read_file any path above:");
console.log('    [plugins] armoriq: verify-step result tool=read_file allowed=false');
console.log('    reason=ArmorIQ intent drift: tool not in plan');
console.log("\n  ArmorClaw compares each tool call against the cryptographic");
console.log("  intent token issued at the start of the request.");
console.log("  Any deviation = immediate block.");
console.log("\n  This demonstrates ArmorClaw's CSRG Merkle tree proof system:");
console.log("    1. Intent token generated from approved plan (web_search only)");
console.log("    2. Each tool call verified against the token");
console.log("    3. read_file fails cryptographic proof → BLOCKED");
console.log("====================================================\n");
