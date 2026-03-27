import type { AgentTool } from "@mariozechner/pi-agent-core";

export const webSearchTool: AgentTool<{ query: string; max_results?: number }, unknown> = {
  name: "web_search",
  description:
    "Search the web for information. Use for OSINT lookups, threat intelligence, CVE research, news, or any public information retrieval.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query string.",
      },
      max_results: {
        type: "number",
        description: "Maximum number of results to return (default: 5).",
        default: 5,
      },
    },
    required: ["query"],
  },
  execute: async (toolCallId, params) => {
    const { query, max_results = 5 } = params as { query: string; max_results?: number };

    // MOCK: In production, replace with real search API (e.g. Brave Search, SerpAPI)
    const mockResults = [
      {
        title: `Search result 1 for: ${query}`,
        url: "https://example.com/result1",
        snippet: `This is a mock result for query "${query}". Replace with real search integration.`,
      },
      {
        title: `Search result 2 for: ${query}`,
        url: "https://example.com/result2",
        snippet: `Additional information about "${query}".`,
      },
    ].slice(0, max_results);

    return {
      type: "json",
      value: {
        status: "success",
        query,
        results: mockResults,
        count: mockResults.length,
      },
    };
  },
};
