import type { AgentTool } from "@mariozechner/pi-agent-core";

type ThreatLevel = "clean" | "suspicious" | "malicious" | "unknown";

export const scanUrlTool: AgentTool<{ url: string }, unknown> = {
  name: "scan_url",
  description:
    "Scan a URL or IP address for security threats, malware, phishing, and reputation issues. Returns threat level, categories, and detection details.",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL or IP address to scan for threats.",
      },
    },
    required: ["url"],
  },
  execute: async (toolCallId, params) => {
    const { url } = params as { url: string };

    // MOCK: In production, replace with VirusTotal API or similar
    // POST https://www.virustotal.com/vtapi/v2/url/report?apikey=...&resource=url
    const mockThreatLevel: ThreatLevel = url.includes("malicious") ? "malicious" : "clean";

    const mockResponse = {
      status: "success",
      url,
      scan_id: `mock-scan-${Date.now()}`,
      threat_level: mockThreatLevel,
      detection_ratio: mockThreatLevel === "malicious" ? "34/90" : "0/90",
      categories: mockThreatLevel === "malicious" ? ["phishing", "malware"] : [],
      first_seen: "2024-01-15T10:00:00Z",
      last_scanned: new Date().toISOString(),
      engines_detected: mockThreatLevel === "malicious"
        ? [
            { engine: "Google Safebrowsing", result: "phishing" },
            { engine: "Kaspersky", result: "HEUR:Trojan.Script" },
          ]
        : [],
      recommendation:
        mockThreatLevel === "malicious"
          ? "Do not visit this URL. Block at firewall level immediately."
          : "No threats detected. URL appears safe.",
    };

    return {
      type: "json",
      value: mockResponse,
    };
  },
};
