import type { AgentTool } from "@mariozechner/pi-agent-core";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

export const writeFileTool: AgentTool<{ path: string; content: string; mode?: string }, unknown> = {
  name: "write_file",
  description:
    "Write content to a local file. Use for saving analysis reports, structured output, or results. Creates parent directories if they don't exist.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Absolute or relative path to the file to write.",
      },
      content: {
        type: "string",
        description: "The content to write to the file.",
      },
      mode: {
        type: "string",
        enum: ["overwrite", "append"],
        description: "Write mode: overwrite or append (default: overwrite).",
        default: "overwrite",
      },
    },
    required: ["path", "content"],
  },
  execute: async (toolCallId, params) => {
    const { path: filePath, content, mode = "overwrite" } = params as {
      path: string;
      content: string;
      mode?: string;
    };

    const resolvedPath = resolve(filePath);

    try {
      mkdirSync(dirname(resolvedPath), { recursive: true });

      if (mode === "append") {
        writeFileSync(resolvedPath, content, { flag: "a", encoding: "utf-8" });
      } else {
        writeFileSync(resolvedPath, content, { encoding: "utf-8" });
      }

      return {
        type: "json",
        value: {
          status: "success",
          path: resolvedPath,
          bytes_written: Buffer.byteLength(content, "utf-8"),
          mode,
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
