export interface OwnerRequirements {
  goals: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  specificationDetails: string;
  runtimeRequirements: string[];
  testRequirements: string[];
  outputFormatExpectations: string[];
}

export interface PersistentContext {
  ownerRequirements: Readonly<OwnerRequirements>;
  createdAt: string;
  locked: true;
}

export interface StructuredLogLine {
  stream: "stdout" | "stderr";
  line: string;
  timestamp: string;
}

export interface WorkerExecutionResult {
  compile: { success: boolean; exitCode: number; stderr: StructuredLogLine[] };
  run: { success: boolean; exitCode: number; stalled: boolean; stdout: StructuredLogLine[]; stderr: StructuredLogLine[] };
}

export interface PromptConstructionInput {
  currentCodeState: string;
  specSectionFocus?: string;
  errorLog?: { fullLog: string; lineCaused?: string };
  retryCount: number;
  maxRetries: number;
}

export interface OrchestratorInstructions {
  instructions: string;
  retryCount: number;
  maxRetries: number;
  strategy: string;
  context: {
    currentCodeState: string;
    relevantSpecSection: string;
    errorLog: { fullLog: string; lineCaused?: string } | null;
  };
}

export type ErrorClassification = "syntax_error" | "runtime_exception" | "logic_error" | "spec_mismatch" | "none";

export interface ErrorAnalysisResult {
  classification: ErrorClassification;
  reason: string;
  fixPrompt: string;
}

export interface ValidationTestCase {
  args?: string[];
  expectedStdoutContains?: string;
  expectedExitCode?: number;
}

export interface ValidationRequest {
  expectedOutput?: string;
  expectedType?: "string" | "number" | "boolean" | "array" | "object";
  requiredSubstrings?: string[];
  testCases?: ValidationTestCase[];
}

export interface ValidationResult {
  passed: boolean;
  reasons: string[];
  testResults: Array<{ index: number; passed: boolean; reason: string }>;
}
