import fs from "fs-extra";
import ora, { Ora } from "ora";
import chalk from "chalk";
import { apiClient } from "../api";
import { formatters } from "../formatters";

export interface RunOptions {
  code: string;
  filename?: string;
  args?: string[];
  validationFile?: string;
  maxRetries?: number;
}

export const runCommand = async (options: RunOptions): Promise<void> => {
  // Load validation spec if provided
  let validationRequest: Record<string, unknown> = {};
  if (options.validationFile) {
    if (!fs.existsSync(options.validationFile)) {
      console.log(formatters.error(`Validation file not found: ${options.validationFile}`));
      process.exit(1);
    }
    validationRequest = fs.readJsonSync(options.validationFile);
  }

  const spinner = ora().start();

  try {
    // Initial health check
    spinner.text = "Checking server...";
    const healthy = await apiClient.healthCheck();
    if (!healthy) {
      spinner.fail("Server is not responding");
      process.exit(1);
    }
    spinner.succeed("Server is healthy");

    // Run the orchestration
    console.log(formatters.divider("ORCHESTRATION RUN"));

    const maxRetries = options.maxRetries ?? 3;
    let retryCount = 0;
    let done = false;

    while (!done && retryCount <= maxRetries) {
      displayPhaseProgress(retryCount, maxRetries);

      spinner.text = `Running phase 1-4 (retry ${retryCount}/${maxRetries})...`;

      const result = await apiClient.orchestrateRun({
        code: options.code,
        filename: options.filename,
        args: options.args,
        currentCodeState: options.code,
        validationRequest,
        retryCount,
        maxRetries,
      });

      spinner.stop();

      // Display results
      displayOrchestratorResults(result, retryCount);

      // Check if we're done
      const execution = result.execution as { run: { success: boolean } };
      const validation = result.validation as { passed: boolean };

      if (execution.run.success && validation.passed) {
        console.log(formatters.success("All phases passed!\n"));
        done = true;
      } else if (result.escalatedToOwner) {
        console.log(
          formatters.error(
            `\nMax retries reached. Escalating to owner.\nReason: ${result.escalationReason}\n`,
          ),
        );
        process.exit(1);
      } else {
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(
            chalk.yellow(
              `\nNot yet passing. Retrying... (${retryCount}/${maxRetries})\n`,
            ),
          );
          spinner.start();
        }
      }
    }
  } catch (error) {
    spinner.fail("Orchestration failed");
    console.error(
      formatters.error(error instanceof Error ? error.message : String(error)),
    );
    process.exit(1);
  }
};

function displayPhaseProgress(retryCount: number, maxRetries: number): void {
  const progress = `${retryCount}/${maxRetries}`;
  console.log(chalk.cyan(`\n[Retry ${progress}]\n`));
}

function displayOrchestratorResults(result: Record<string, unknown>, retryCount: number): void {
  const { prompt, execution, validation, analysis } = result as {
    prompt: { strategy: string };
    execution: {
      compile: { success: boolean; exitCode: number };
      run: { success: boolean; exitCode: number; stalled: boolean; stdout: Array<{ line: string }> };
    };
    validation: { passed: boolean; reasons: string[]; testResults: Array<{ index: number; passed: boolean; reason: string }> };
    analysis: { classification: string; reason: string; fixPrompt: string };
  };

  // Phase 1: Prompt
  console.log(formatters.subheader("Phase 1: Prompt Construction"));
  console.log(`Strategy: ${prompt.strategy}\n`);

  // Phase 2: Execution
  console.log(formatters.subheader("Phase 2: Execution"));
  console.log(formatters.executionResult(execution));

  // Phase 4: Validation
  console.log(formatters.subheader("Phase 4: Validation"));
  console.log(formatters.validationResult(validation.passed, validation.reasons));

  if (validation.testResults.length > 0) {
    console.log(formatters.subheader("Test Results"));
    console.log(formatters.testResults(validation.testResults));
  }

  // Phase 3: Error Analysis
  if (!execution.run.success || !validation.passed) {
    console.log(formatters.subheader("Phase 3: Error Analysis"));
    console.log(formatters.errorAnalysis(analysis));
  }
}
