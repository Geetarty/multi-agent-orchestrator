import test from "node:test";
import assert from "node:assert/strict";
import { ContextStore } from "../services/contextStore";
import { OrchestratorService } from "../services/orchestratorService";
import { ValidationService } from "../services/validationService";
import { ErrorAnalysisService } from "../services/errorAnalysisService";

const ownerRequirements = {
  goals: ["Return correct sum"],
  constraints: ["must run in Python 3.11", "no external libs"],
  acceptanceCriteria: ["Matches expected output"],
  specificationDetails: "Implement add(a,b)",
  runtimeRequirements: ["python3.11"],
  testRequirements: ["include edge cases"],
  outputFormatExpectations: ["plain text"],
};

test("context store locks owner requirements after first set", () => {
  const store = new ContextStore();
  const context = store.setOwnerRequirements(ownerRequirements);
  assert.equal(context.locked, true);
  assert.throws(() => {
    store.setOwnerRequirements(ownerRequirements);
  }, /locked/);
});

test("orchestrator retry strategy changes for retry 2+", () => {
  const orchestrator = new OrchestratorService();
  const prompt = orchestrator.constructInstructions(
    {
      currentCodeState: "def main(): pass",
      retryCount: 2,
      maxRetries: 3,
      errorLog: { fullLog: "NameError at line 4", lineCaused: "line 4" },
    },
    ownerRequirements,
  );

  assert.match(prompt.strategy, /Retry 2\+/);
  assert.match(prompt.instructions, /Full error log: NameError at line 4/);
});

test("validation and analysis detect spec mismatches", () => {
  const validationService = new ValidationService();
  const analysisService = new ErrorAnalysisService();

  const execution = {
    compile: { success: true, exitCode: 0, stderr: [] },
    run: {
      success: true,
      exitCode: 0,
      stalled: false,
      stdout: [{ stream: "stdout" as const, line: "2", timestamp: new Date().toISOString() }],
      stderr: [],
    },
  };

  const validation = validationService.validate(
    { expectedOutput: "3", expectedType: "number", testCases: [{ expectedStdoutContains: "3" }] },
    execution,
  );

  assert.equal(validation.passed, false);

  const analysis = analysisService.analyze(execution, validation);
  assert.equal(analysis.classification, "spec_mismatch");
});
