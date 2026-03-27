import type { AgentTool } from "@mariozechner/pi-agent-core";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface Finding {
  line: number;
  severity: Severity;
  rule: string;
  message: string;
  code_snippet: string;
}

export const codeAnalyzeTool: AgentTool<{ code: string; language?: string; file_path?: string }, unknown> = {
  name: "code_analyze",
  description:
    "Perform static code analysis to detect security vulnerabilities, code quality issues, and suspicious patterns. Supports TypeScript, JavaScript, Python, Java, and more.",
  parameters: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "The source code to analyze.",
      },
      language: {
        type: "string",
        description: "Programming language of the code (e.g. typescript, python, java).",
        default: "unknown",
      },
      file_path: {
        type: "string",
        description: "Optional file path for context (used in report output).",
      },
    },
    required: ["code"],
  },
  execute: async (toolCallId, params) => {
    const { code, language = "unknown", file_path = "unnamed" } = params as {
      code: string;
      language?: string;
      file_path?: string;
    };

    // MOCK: In production, integrate with semgrep, oxlint, bandit, or CodeQL
    const findings: Finding[] = [];

    // Simple pattern-based mock analysis
    const lines = code.split("\n");
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      if (/eval\s*\(/.test(line)) {
        findings.push({
          line: lineNum,
          severity: "critical",
          rule: "no-eval",
          message: "Use of eval() is dangerous and allows arbitrary code execution",
          code_snippet: line.trim(),
        });
      }

      if (/password\s*=\s*['"][^'"]+['"]/i.test(line)) {
        findings.push({
          line: lineNum,
          severity: "high",
          rule: "no-hardcoded-credentials",
          message: "Hardcoded password detected in source code",
          code_snippet: line.trim().replace(/=\s*['"][^'"]+['"]/, '= "***REDACTED***"'),
        });
      }

      if (/exec\s*\(|child_process|os\.system|subprocess/.test(line)) {
        findings.push({
          line: lineNum,
          severity: "high",
          rule: "dangerous-system-call",
          message: "Potentially dangerous system/shell command execution detected",
          code_snippet: line.trim(),
        });
      }

      if (/\ASQL\|SELECT.*FROM|INSERT INTO|DROP TABLE/i.test(line) && /\+|format\(|%s/.test(line)) {
        findings.push({
          line: lineNum,
          severity: "critical",
          rule: "sql-injection",
          message: "Possible SQL injection via string concatenation or formatting",
          code_snippet: line.trim(),
        });
      }
    });

    return {
      type: "json",
      value: {
        status: "success",
        file: file_path,
        language,
        lines_analyzed: lines.length,
        findings_count: findings.length,
        severity_summary: {
          critical: findings.filter((f) => f.severity === "critical").length,
          high: findings.filter((f) => f.severity === "high").length,
          medium: findings.filter((f) => f.severity === "medium").length,
          low: findings.filter((f) => f.severity === "low").length,
        },
        findings,
      },
    };
  },
};
