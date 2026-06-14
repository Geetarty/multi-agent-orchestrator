import { ValidationRequest, ValidationResult, WorkerExecutionResult } from "../types/orchestration";

const joinStdout = (execution: WorkerExecutionResult): string =>
  execution.run.stdout.map((line) => line.line).join("\n");

export class ValidationService {
  public validate(request: ValidationRequest, execution: WorkerExecutionResult): ValidationResult {
    const reasons: string[] = [];
    const output = joinStdout(execution);

    if (!execution.run.success) reasons.push("Execution did not complete successfully.");

    if (request.expectedOutput !== undefined && output !== request.expectedOutput) {
      reasons.push(`Output does not match owner spec. Expected: "${request.expectedOutput}", got: "${output}".`);
    }

    if (request.requiredSubstrings?.length) {
      for (const token of request.requiredSubstrings) {
        if (!output.includes(token)) reasons.push(`Output is missing required substring: "${token}".`);
      }
    }

    if (request.expectedType) {
      const typeReason = this.checkOutputType(request.expectedType, output);
      if (typeReason) reasons.push(typeReason);
    }

    const testResults = (request.testCases ?? []).map((testCase, index) => {
      const mismatches: string[] = [];
      if (testCase.expectedExitCode !== undefined && execution.run.exitCode !== testCase.expectedExitCode) {
        mismatches.push(`Expected exit code ${testCase.expectedExitCode}, got ${execution.run.exitCode}.`);
      }
      if (testCase.expectedStdoutContains && !output.includes(testCase.expectedStdoutContains)) {
        mismatches.push(`Expected stdout to contain "${testCase.expectedStdoutContains}".`);
      }
      return { index, passed: mismatches.length === 0, reason: mismatches.length === 0 ? "Passed" : mismatches.join(" | ") };
    });

    if (testResults.some((r) => !r.passed)) reasons.push("One or more test cases failed.");

    return { passed: reasons.length === 0, reasons, testResults };
  }

  private checkOutputType(expectedType: NonNullable<ValidationRequest["expectedType"]>, output: string): string | null {
    try {
      if (expectedType === "string") return null;
      if (expectedType === "number") return Number.isFinite(Number(output)) ? null : "Output is not a valid number.";
      if (expectedType === "boolean") return output === "true" || output === "false" ? null : "Output is not a valid boolean string.";
      const parsed: unknown = JSON.parse(output);
      if (expectedType === "array" && !Array.isArray(parsed)) return "Output is not a JSON array.";
      if (expectedType === "object" && (Array.isArray(parsed) || parsed === null || typeof parsed !== "object")) return "Output is not a JSON object.";
      return null;
    } catch {
      return `Output is not valid JSON for expected type "${expectedType}".`;
    }
  }
}
