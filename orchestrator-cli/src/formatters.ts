import chalk from "chalk";
import { table } from "table";

export const formatters = {
  // ─── Status indicators ────────────────────────────────────────────────────

  success: (text: string): string => chalk.green(`✓ ${text}`),
  error: (text: string): string => chalk.red(`✗ ${text}`),
  warning: (text: string): string => chalk.yellow(`⚠ ${text}`),
  info: (text: string): string => chalk.blue(`ℹ ${text}`),
  muted: (text: string): string => chalk.gray(text),

  // ─── Dividers ─────────────────────────────────────────────────────────────

  divider: (title?: string): string => {
    const line = "─".repeat(80);
    return title ? `${chalk.cyan(title)} ${chalk.gray(line)}` : chalk.gray(line);
  },

  // ─── Headers ──────────────────────────────────────────────────────────────

  header: (text: string): string => chalk.bold.cyan(`\n${text}\n`),
  subheader: (text: string): string => chalk.bold.white(text),

  // ─── JSON pretty-print ────────────────────────────────────────────────────

  json: (obj: unknown): string => JSON.stringify(obj, null, 2),

  // ─── Validation result ────────────────────────────────────────────────────

  validationResult: (passed: boolean, reasons: string[]): string => {
    const status = passed ? formatters.success("PASSED") : formatters.error("FAILED");
    let output = `Validation: ${status}\n`;

    if (reasons.length > 0) {
      output += `Reasons:\n`;
      reasons.forEach((reason) => {
        output += `  ${formatters.muted("•")} ${reason}\n`;
      });
    }

    return output;
  },

  // ─── Execution result ─────────────────────────────────────────────────────

  executionResult: (result: {
    compile: { success: boolean; exitCode: number };
    run: { success: boolean; exitCode: number; stalled: boolean; stdout: Array<{ line: string }> };
  }): string => {
    let output = "";

    // Compile status
    const compileStatus = result.compile.success
      ? formatters.success("Compilation successful")
      : formatters.error(`Compilation failed (exit ${result.compile.exitCode})`);
    output += `${compileStatus}\n`;

    // Run status
    if (result.run.stalled) {
      output += formatters.error("Execution stalled (timeout)\n");
    } else {
      const runStatus = result.run.success
        ? formatters.success("Execution successful")
        : formatters.error(`Execution failed (exit ${result.run.exitCode})`);
      output += `${runStatus}\n`;
    }

    // Output
    if (result.run.stdout.length > 0) {
      output += formatters.subheader("Output:");
      output += "\n";
      result.run.stdout.forEach((line) => {
        output += `  ${line.line}\n`;
      });
    }

    return output;
  },

  // ─── Error analysis ───────────────────────────────────────────────────────

  errorAnalysis: (analysis: {
    classification: string;
    reason: string;
    fixPrompt: string;
  }): string => {
    let output = "";
    output += `Classification: ${chalk.yellow(analysis.classification)}\n`;
    output += `Reason: ${analysis.reason}\n`;
    output += `Fix Strategy: ${formatters.muted(analysis.fixPrompt)}\n`;
    return output;
  },

  // ─── Test results table ───────────────────────────────────────────────────

  testResults: (
    results: Array<{ index: number; passed: boolean; reason: string }>,
  ): string => {
    if (results.length === 0) return "No test cases.\n";

    const rows = [
      [chalk.bold("Test #"), chalk.bold("Status"), chalk.bold("Reason")],
      ...results.map((r) => [
        String(r.index),
        r.passed ? formatters.success("PASS") : formatters.error("FAIL"),
        r.reason,
      ]),
    ];

    return `\n${table(rows, { singleLine: true })}\n`;
  },

  // ─── Phase progress ───────────────────────────────────────────────────────

  phaseProgress: (phase: number, total: number, name: string): string => {
    const progress = `${phase}/${total}`;
    return chalk.cyan(`[Phase ${progress}] ${name}`);
  },
};
