import ora from "ora";
import { configManager } from "../config";
import { formatters } from "../formatters";

export const configSetCommand = (key: string, value: string): void => {
  try {
    if (key === "apiBaseUrl") {
      configManager.set({ apiBaseUrl: value });
      console.log(formatters.success(`API base URL set to: ${value}`));
    } else if (key === "apiKey") {
      configManager.set({ apiKey: value });
      console.log(formatters.success(`API key configured`));
    } else {
      console.log(formatters.error(`Unknown config key: ${key}`));
      process.exit(1);
    }
  } catch (error) {
    console.log(formatters.error(`Failed to set config: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
};

export const configShowCommand = (): void => {
  try {
    const config = configManager.get();
    console.log(formatters.header("Current Configuration"));
    console.log(`API Base URL: ${formatters.muted(config.apiBaseUrl)}`);
    console.log(`API Key: ${config.apiKey ? formatters.muted("(set)") : formatters.muted("(not set)")}`);
  } catch (error) {
    console.log(formatters.error(`Failed to read config: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
};

export const configResetCommand = (): void => {
  try {
    configManager.set({ apiBaseUrl: "http://localhost:3000" });
    console.log(formatters.success("Configuration reset to defaults"));
  } catch (error) {
    console.log(formatters.error(`Failed to reset config: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
};
