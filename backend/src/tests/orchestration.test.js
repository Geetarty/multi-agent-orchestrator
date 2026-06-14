"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const contextStore_1 = require("../services/contextStore");
const orchestratorService_1 = require("../services/orchestratorService");
const validationService_1 = require("../services/validationService");
const errorAnalysisService_1 = require("../services/errorAnalysisService");
const ownerRequirements = {
    goals: ["Return correct sum"],
    constraints: ["must run in Python 3.11", "no external libs"],
    acceptanceCriteria: ["Matches expected output"],
    specificationDetails: "Implement add(a, b) that returns the sum of two integers.",
    runtimeRequirements: ["python3.11"],
    testRequirements: ["include edge cases"],
    outputFormatExpectations: ["plain text integer"],
};
// ContextStore
(0, node_test_1.default)("context store: locks owner requirements after first set", () => {
    const store = new contextStore_1.ContextStore();
    const context = store.setOwnerRequirements(ownerRequirements);
    strict_1.default.equal(context.locked, true);
    strict_1.default.throws(() => store.setOwnerRequirements(ownerRequirements), /locked/);
});
(0, node_test_1.default)("context store: getContext returns null before any set", () => {
    const store = new contextStore_1.ContextStore();
    strict_1.default.equal(store.getContext(), null);
});
(0, node_test_1.default)("context store: reset allows re-setting requirements", () => {
    const store = new contextStore_1.ContextStore();
    store.setOwnerRequirements(ownerRequirements);
    store.reset();
    strict_1.default.doesNotThrow(() => store.setOwnerRequirements(ownerRequirements));
});
// OrchestratorService
(0, node_test_1.default)("orchestrator: initial attempt strategy", () => {
    const o = new orchestratorService_1.OrchestratorService();
    const p = o.constructInstructions({ currentCodeState: "pass", retryCount: 0, maxRetries: 3 }, ownerRequirements);
    strict_1.default.match(p.strategy, /Initial attempt/);
});
(0, node_test_1.default)("orchestrator: retry 2+ strategy", () => {
    const o = new orchestratorService_1.OrchestratorService();
    const p = o.constructInstructions({ currentCodeState: "pass", retryCount: 2, maxRetries: 3, errorLog: { fullLog: "NameError at line 4", lineCaused: "line 4" } }, ownerRequirements);
    strict_1.default.match(p.strategy, /Retry 2\+/);
    strict_1.default.match(p.instructions, /NameError at line 4/);
});
// ValidationService
const makeExecution = (stdout, success = true) => ({
    compile: { success: true, exitCode: 0, stderr: [] },
    run: { success, exitCode: success ? 0 : 1, stalled: false, stdout: stdout ? [{ stream: "stdout", line: stdout, timestamp: new Date().toISOString() }] : [], stderr: [] },
});
(0, node_test_1.default)("validation: passes when output matches", () => {
    strict_1.default.equal(new validationService_1.ValidationService().validate({ expectedOutput: "3" }, makeExecution("3")).passed, true);
});
(0, node_test_1.default)("validation: fails when output mismatches", () => {
    strict_1.default.equal(new validationService_1.ValidationService().validate({ expectedOutput: "3" }, makeExecution("2")).passed, false);
});
// ErrorAnalysisService
(0, node_test_1.default)("error analysis: syntax_error on compile failure", () => {
    const result = new errorAnalysisService_1.ErrorAnalysisService().analyze({ compile: { success: false, exitCode: 1, stderr: [] }, run: { success: false, exitCode: 1, stalled: false, stdout: [], stderr: [] } });
    strict_1.default.equal(result.classification, "syntax_error");
});
(0, node_test_1.default)("error analysis: spec_mismatch classification", () => {
    const validation = { passed: false, reasons: ["Output does not match owner spec."], testResults: [] };
    strict_1.default.equal(new errorAnalysisService_1.ErrorAnalysisService().analyze(makeExecution("2"), validation).classification, "spec_mismatch");
});
(0, node_test_1.default)("error analysis: none when all passes", () => {
    const validation = { passed: true, reasons: [], testResults: [] };
    strict_1.default.equal(new errorAnalysisService_1.ErrorAnalysisService().analyze(makeExecution("3"), validation).classification, "none");
});
