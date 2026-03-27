import type { AgentTool } from "@mariozechner/pi-agent-core";

export const summarizeTool: AgentTool<
  { text: string; format?: string; max_length?: number },
  unknown
> = {
  name: "summarize",
  description:
    "Summarize a long piece of text into a concise, structured summary. Use for condensing reports, logs, articles, or any large text into key points.",
  parameters: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text content to summarize.",
      },
      format: {
        type: "string",
        enum: ["bullet_points", "paragraph", "structured_report"],
        description: "Output format for the summary (default: bullet_points).",
        default: "bullet_points",
      },
      max_length: {
        type: "number",
        description: "Maximum word count for the summary (default: 200).",
        default: 200,
      },
    },
    required: ["text"],
  },
  execute: async (toolCallId, params) => {
    const { text, format = "bullet_points", max_length = 200 } = params as {
      text: string;
      format?: string;
      max_length?: number;
    };

    // MOCK: In production, this would call an LLM (OpenAI) for real summarization
    // The gateway's LLM can also summarize inline — this tool is for explicit calls
    const wordCount = text.split(/\s+/).length;
    const truncated = wordCount > 500 ? text.split(/\s+/).slice(0, 500).join(" ") + "..." : text;

    const mockSummary =
      format === "bullet_points"
        ? [
            `• Main topic: ${truncated.slice(0, 80)}...`,
            `• Key detail 1: Content analyzed from ${wordCount} words`,
            `• Key detail 2: Summary generated in ${format} format`,
            `• Recommendation: Review full content for context`,
          ].join("\n")
        : format === "structured_report"
        ? `## Summary Report\n\n**Overview:** ${truncated.slice(0, 120)}...\n\n**Key Findings:**\n- Content length: ${wordCount} words\n- Format: ${format}\n\n**Recommendation:** Review full source material.`
        : `Summary: ${truncated.slice(0, 150)}... (${wordCount} words analyzed)`;

    return {
      type: "json",
      value: {
        status: "success",
        original_word_count: wordCount,
        format,
        summary: mockSummary,
      },
    };
  },
};
