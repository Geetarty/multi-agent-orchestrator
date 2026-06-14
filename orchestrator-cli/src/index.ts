#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import axios from "axios";
import * as fs from "fs";

const program = new Command();

let apiBaseUrl = "http://localhost:3001";

// Config commands
const configCmd = program.command("config").description("Manage configuration");

configCmd
  .command("set <key> <value>")
  .description("Set configuration value")
  .action((key: string, value: string) => {
    if (key === "apiBaseUrl") {
      apiBaseUrl = value;
      console.log(chalk.green(`✓ Set ${key} to ${value}`));
    }
  });

configCmd.command("show").description("Show current configuration").action(() => {
  console.log(chalk.blue("Current Configuration:"));
  console.log(`  apiBaseUrl: ${apiBaseUrl}`);
});

// Context commands
const contextCmd = program.command("context").description("Manage owner requirements");

contextCmd
  .command("set <file>")
  .description("Set owner requirements from JSON file")
  .action(async (file: string) => {
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      await axios.post(`${apiBaseUrl}/api/context/owner`, data);
      console.log(chalk.green("✓ Owner requirements set"));
    } catch (error) {
      console.error(chalk.red("✗ Failed to set requirements"), error);
    }
  });

contextCmd
  .command("show")
  .description("Show current owner requirements")
  .action(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/context/owner`);
      console.log(chalk.blue("Owner Requirements:"));
      console.log(JSON.stringify(response.data.ownerRequirements, null, 2));
    } catch (error) {
      console.error(chalk.red("✗ Failed to fetch requirements"), error);
    }
  });

// Run command
program
  .command("run <codeFile>")
  .description("Run orchestration")
  .option("-v, --validation <file>", "Validation JSON file")
  .action(async (codeFile: string, options: any) => {
    try {
      const code = fs.readFileSync(codeFile, "utf-8");
      const validation = options.validation ? JSON.parse(fs.readFileSync(options.validation, "utf-8")) : {};

      console.log(chalk.cyan("\n🤖 Multi-Agent Orchestrator CLI"));
      
      const response = await axios.get(`${apiBaseUrl}/health`);
      console.log(chalk.green("✔ Server is healthy"));

      const runResponse = await axios.post(`${apiBaseUrl}/api/orchestrator/run`, {
        code,
        validationRequest: validation,
        filename: "solution.py",
      });

      const data = runResponse.data;
      console.log(chalk.cyan("\nORCHESTRATION RUN"));
      console.log(`[Retry ${data.retryCount}/${data.results.length - 1}]\n`);

      const lastResult = data.results[data.results.length - 1];
      
      console.log(chalk.yellow(`Phase 1: Prompt Construction — Strategy: ${lastResult.prompt?.strategy || "N/A"}`));
      console.log(
        chalk.yellow(
          `Phase 2: Execution — ${lastResult.execution.compile.success ? "✓" : "✗"} Compilation ${
            lastResult.execution.compile.success ? "successful" : "failed"
          }, ${lastResult.execution.run.success ? "✓" : "✗"} Execution ${lastResult.execution.run.success ? "successful" : "failed"}`
        )
      );

      if (lastResult.execution.run.stdout.length > 0) {
        console.log(`Output: ${lastResult.execution.run.stdout.map((l: any) => l.line).join("")}`);
      }

      console.log(
        chalk.yellow(`Phase 4: Validation — ${lastResult.validation.passed ? "✓ PASSED" : "✗ FAILED"}`)
      );

      console.log("\n" + chalk.green(`✓ ${data.finalStatus}`));
    } catch (error: any) {
      console.error(chalk.red("✗ Orchestration failed"));
      console.error(error.response?.data || error.message);
      if (error.response?.data?.results) {
        console.log("DEBUG - Response data:", JSON.stringify(error.response.data, null, 2));
      }
    }
  });

program.parse(process.argv);
