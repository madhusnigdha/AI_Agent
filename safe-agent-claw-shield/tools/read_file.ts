import type { AgentTool } from "@mariozechner/pi-agent-core";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export const readFileTool: AgentTool<{ path: string; encoding?: string }, unknown> = {
  name: "read_file",
  description:
    "Read the contents of a local file. Use for analyzing log files, reports, code files, data files, or configuration files.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute or relative path to the file to read.",
      },
      encoding: {
        type: "string",
        description: "File encoding (default: utf-8).",
        default: "utf-8",
      },
    },
    required: ["path"],
  },
  execute: async (toolCallId, params) => {
    const { path: filePath, encoding = "utf-8" } = params as { path: string; encoding?: string };

    const resolvedPath = resolve(filePath);

    if (!existsSync(resolvedPath)) {
      return {
        type: "json",
        value: {
          status: "error",
          path: resolvedPath,
          error: `File not found: ${resolvedPath}`,
        },
      };
    }

    try {
      const content = readFileSync(resolvedPath, encoding as BufferEncoding);
      return {
        type: "json",
        value: {
          status: "success",
          path: resolvedPath,
          size_bytes: Buffer.byteLength(content, encoding as BufferEncoding),
          content,
        },
      };
    } catch (err) {
      return {
        type: "json",
        value: {
          status: "error",
          path: resolvedPath,
          error: String(err),
        },
      };
    }
  },
};
