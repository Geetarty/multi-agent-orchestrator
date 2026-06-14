import test from "node:test";
import assert from "node:assert/strict";
import { ContextStore } from "../services/contextStore";
import { OrchestratorService } from "../services/orchestratorService";
import { ValidationService } from "../services/validationService";
import { ErrorAnalysisService } from "../services/errorAnalysisService";
import { OwnerRequirements } from "../types/orchestration";

const ownerRequirements: OwnerRequirements = {
  goals: ["Return correct sum"],
  constraints: ["must run in Python 3.11", "no external libs"],
  acceptanceCriteria: ["Matches expected output"],
  specificationDetails: "Implement add(a, b) that returns the sum of two integers.",
  runtimeRequirements: ["python3.11"],
  testRequirements: ["include edge cases"],
  outputFormatExpectations: ["plain text integer"],
};

test("context store: locks owner requirements after first set", async () => {
  const store = new ContextStore();
  const context = await store.setOwnerRequirements(ownerRequirements);
  assert.equal(context.locked, true);
});

test("orchestrator: initial attempt uses full-solution strategy", () => {
  const orchestrator = new OrchestratorService();
  const prompt = orchestrator.constructInstructions(
    { currentCodeState: "def add(a, b): pass", retryCount: 0, maxRetries: 3 },
    ownerRequirements,
  );
  assert.match(prompt.strategy, /Initial attempt/);
});

test("validation: passes when output matches expected", () => {
  const service = new ValidationService();
  const result = service.validate({ expectedOutput: "3" }, {
    compile: { success: true, exitCode: 0, stderr: [] },
    run: {
      success: true,
      exitCode: 0,
      stalled: false,
      stdout: [{ stream: "stdout", line: "3", timestamp: new Date().toISOString() }],
      stderr: [],
    },
  });
  assert.equal(result.passed, true);
});

test("error analysis: classifies compile failure as syntax_error", () => {
  const service = new ErrorAnalysisService();
  const result = service.analyze({
    compile: { success: false, exitCode: 1, stderr: [] },
    run: { success: false, exitCode: 1, stalled: false, stdout: [], stderr: [] },
  });
  assert.equal(result.classification, "syntax_error");
});
