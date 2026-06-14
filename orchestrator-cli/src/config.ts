import path from "node:path";
import os from "node:os";
import fs from "fs-extra";

const configDir = path.join(os.homedir(), ".orchestrator");
const configFile = path.join(configDir, "config.json");

export interface Config {
  apiBaseUrl: string;
  apiKey?: string;
}

const defaultConfig: Config = {
  apiBaseUrl: "http://localhost:3000",
};

export class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.load();
  }

  private load(): Config {
    try {
      if (fs.existsSync(configFile)) {
        return fs.readJsonSync(configFile);
      }
    } catch {
      // Fall back to default
    }
    return { ...defaultConfig };
  }

  public save(): void {
    fs.ensureDirSync(configDir);
    fs.writeJsonSync(configFile, this.config, { spaces: 2 });
  }

  public get(): Config {
    return { ...this.config };
  }

  public set(partial: Partial<Config>): void {
    this.config = { ...this.config, ...partial };
    this.save();
  }
}

export const configManager = new ConfigManager();
