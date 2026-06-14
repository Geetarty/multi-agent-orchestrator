import test from "node:test";
import assert from "node:assert/strict";
import { formatters } from "../formatters";

test("formatters: success indicator", () => {
  const output = formatters.success("Test passed");
  assert.ok(output.includes("✓"));
  assert.ok(output.includes("Test passed"));
});

test("formatters: error indicator", () => {
  const output = formatters.error("Test failed");
  assert.ok(output.includes("✗"));
  assert.ok(output.includes("Test failed"));
});

test("formatters: warning indicator", () => {
  const output = formatters.warning("Be careful");
  assert.ok(output.includes("⚠"));
  assert.ok(output.includes("Be careful"));
});

test("formatters: JSON formatting", () => {
  const obj = { key: "value", number: 42 };
  const output = formatters.json(obj);
  assert.ok(output.includes("key"));
  assert.ok(output.includes("value"));
});

test("formatters: validation result — passed", () => {
  const output = formatters.validationResult(true, []);
  assert.ok(output.includes("PASSED"));
});

test("formatters: validation result — failed with reasons", () => {
  const output = formatters.validationResult(false, [
    "Reason 1",
    "Reason 2",
  ]);
  assert.ok(output.includes("FAILED"));
  assert.ok(output.includes("Reason 1"));
  assert.ok(output.includes("Reason 2"));
});

test("formatters: execution result — success", () => {
  const result = {
    compile: { success: true, exitCode: 0 },
    run: {
      success: true,
      exitCode: 0,
      stalled: false,
      stdout: [{ line: "Output line" }],
    },
  };
  const output = formatters.executionResult(result);
  assert.ok(output.includes("successful"));
});

test("formatters: test results table", () => {
  const results = [
    { index: 0, passed: true, reason: "Passed" },
    { index: 1, passed: false, reason: "Failed" },
  ];
  const output = formatters.testResults(results);
  assert.ok(output.includes("Test #"));
  assert.ok(output.includes("PASS"));
  assert.ok(output.includes("FAIL"));
});
