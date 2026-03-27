import type { AgentTool } from "@mariozechner/pi-agent-core";

export const dbQueryTool: AgentTool<{ query: string; database?: string }, unknown> = {
  name: "db_query",
  description:
    "Execute a read-only SQL query against a database. Use for data analysis, compliance checks, or reporting. Only SELECT queries are permitted.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "A read-only SQL SELECT query to execute.",
      },
      database: {
        type: "string",
        description: "Database name or connection identifier (optional, uses default if not specified).",
      },
    },
    required: ["query"],
  },
  execute: async (toolCallId, params) => {
    const { query, database = "default" } = params as { query: string; database?: string };

    // Safety: reject any non-SELECT queries
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith("SELECT")) {
      return {
        type: "json",
        value: {
          status: "error",
          query,
          error: "Only SELECT queries are permitted. Mutations (INSERT, UPDATE, DELETE, DROP) are blocked.",
        },
      };
    }

    // MOCK: In production, replace with actual DB connection (pg, sqlite, etc.)
    const mockRows = [
      { id: 1, name: "record_001", value: 42, timestamp: "2026-02-21T10:00:00Z" },
      { id: 2, name: "record_002", value: 87, timestamp: "2026-02-21T11:00:00Z" },
      { id: 3, name: "record_003", value: 13, timestamp: "2026-02-21T12:00:00Z" },
    ];

    return {
      type: "json",
      value: {
        status: "success",
        database,
        query,
        rows_returned: mockRows.length,
        rows: mockRows,
        execution_time_ms: 12,
      },
    };
  },
};
