import fs from "fs-extra";
import ora from "ora";
import chalk from "chalk";
import { apiClient } from "../api";
import { formatters } from "../formatters";

export const contextSetCommand = async (filePath: string): Promise<void> => {
  const spinner = ora("Loading spec file...").start();

  try {
    if (!fs.existsSync(filePath)) {
      spinner.fail(`File not found: ${filePath}`);
      process.exit(1);
    }

    const spec = fs.readJsonSync(filePath);
    spinner.text = "Sending to server...";

    const result = await apiClient.setOwnerContext(spec);

    spinner.succeed("Owner requirements set and locked");
    console.log(formatters.header("Owner Context"));
    console.log(formatters.json(result));
  } catch (error) {
    spinner.fail(`Failed to set owner context`);
    console.error(formatters.error(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
};

export const contextShowCommand = async (): Promise<void> => {
  const spinner = ora("Fetching owner context...").start();

  try {
    const result = await apiClient.getOwnerContext();
    spinner.succeed("Owner context retrieved");
    console.log(formatters.header("Current Owner Context"));
    console.log(formatters.json(result));
  } catch (error) {
    spinner.fail("Failed to fetch owner context");
    console.error(formatters.error(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
};
