import { ErrorAnalysisResult, ValidationResult, WorkerExecutionResult } from "../types/orchestration";

export class ErrorAnalysisService {
  public analyze(execution: WorkerExecutionResult, validation?: ValidationResult): ErrorAnalysisResult {
    if (!execution.compile.success) {
      return {
        classification: "syntax_error",
        reason: "Compilation failed before runtime.",
        fixPrompt: "Fix local syntax and indentation errors near the reported line. Do not change broader logic.",
      };
    }
    if (execution.run.stalled) {
      return {
        classification: "runtime_exception",
        reason: "Execution stalled and was terminated by timeout.",
        fixPrompt: "Inspect control flow and termination conditions to eliminate infinite loops or blocking calls.",
      };
    }
    if (!execution.run.success) {
      return {
        classification: "runtime_exception",
        reason: "Runtime execution failed with a non-zero exit code.",
        fixPrompt: "Inspect the broader runtime context — state, input handling, and edge cases — and repair the failing path.",
      };
    }
    if (validation && !validation.passed) {
      const isSpecMismatch = validation.reasons.some((r) => r.toLowerCase().includes("spec") || r.toLowerCase().includes("owner"));
      if (isSpecMismatch) {
        return {
          classification: "spec_mismatch",
          reason: "Output does not satisfy the owner specification.",
          fixPrompt: "Re-read the owner specificationDetails and acceptanceCriteria, then align behavior and output format exactly.",
        };
      }
      return {
        classification: "logic_error",
        reason: "Execution succeeded but validation failed.",
        fixPrompt: "Focus on algorithm correctness and trace expected vs. actual outputs for each test case.",
      };
    }
    return { classification: "none", reason: "No error detected.", fixPrompt: "No fix required." };
  }
}
