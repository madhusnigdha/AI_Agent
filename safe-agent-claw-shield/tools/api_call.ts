import type { AgentTool } from "@mariozechner/pi-agent-core";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH";

export const apiCallTool: AgentTool<
  { url: string; method?: HttpMethod; headers?: Record<string, string>; body?: unknown },
  unknown
> = {
  name: "api_call",
  description:
    "Make an HTTP request to an external API. Use for fetching live data, integrations, or retrieving information from REST APIs. Only GET and safe methods are recommended.",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The full URL to make the request to.",
      },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "PATCH"],
        description: "HTTP method (default: GET).",
        default: "GET",
      },
      headers: {
        type: "object",
        description: "Optional HTTP request headers as key-value pairs.",
        additionalProperties: { type: "string" },
      },
      body: {
        description: "Optional request body (for POST/PUT/PATCH).",
      },
    },
    required: ["url"],
  },
  execute: async (toolCallId, params) => {
    const { url, method = "GET", headers = {}, body } = params as {
      url: string;
      method?: HttpMethod;
      headers?: Record<string, string>;
      body?: unknown;
    };

    try {
      const requestInit: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Safe-Agent/1.0",
          ...headers,
        },
      };

      if (body && method !== "GET") {
        requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const response = await fetch(url, requestInit);
      const contentType = response.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      return {
        type: "json",
        value: {
          status: "success",
          url,
          method,
          http_status: response.status,
          ok: response.ok,
          response: responseBody,
        },
      };
    } catch (err) {
      return {
        type: "json",
        value: {
          status: "error",
          url,
          method,
          error: String(err),
        },
      };
    }
  },
};
