import { ErrorAnalysisResult, ValidationResult, WorkerExecutionResult } from "../types/orchestration";

export class ErrorAnalysisService {
  public analyze(execution: WorkerExecutionResult, validation?: ValidationResult): ErrorAnalysisResult {
    if (!execution.compile.success) {
      return {
        classification: "syntax_error",
        reason: "Compilation failed before runtime.",
        fixPrompt: "Fix local syntax and indentation errors near the reported line before changing broader logic.",
      };
    }

    if (execution.run.stalled) {
      return {
        classification: "runtime_exception",
        reason: "Execution stalled and was terminated by timeout.",
        fixPrompt: "Inspect control flow and termination conditions across related functions to remove infinite loops.",
      };
    }

    if (!execution.run.success) {
      return {
        classification: "runtime_exception",
        reason: "Runtime execution failed.",
        fixPrompt: "Inspect broader runtime context (state, input handling, and edge cases) and repair the failing path.",
      };
    }

    if (validation && !validation.passed) {
      const specRelated = validation.reasons.some((reason) => reason.toLowerCase().includes("spec"));
      if (specRelated) {
        return {
          classification: "spec_mismatch",
          reason: "Output does not satisfy owner specification.",
          fixPrompt: "Re-read owner specification details and acceptance criteria, then align behavior and output format exactly.",
        };
      }

      return {
        classification: "logic_error",
        reason: "Execution succeeded but validation failed.",
        fixPrompt: "Focus on algorithm correctness and expected outputs for the provided tests.",
      };
    }

    return {
      classification: "none",
      reason: "No error detected.",
      fixPrompt: "No fix required.",
    };
  }
}
