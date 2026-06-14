import axios, { AxiosInstance } from "axios";
import { configManager } from "./config";

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const config = configManager.get();
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });
  }

  public async setOwnerContext(requirements: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await this.client.post("/api/context/owner", requirements);
    return data;
  }

  public async getOwnerContext(): Promise<Record<string, unknown>> {
    const { data } = await this.client.get("/api/context/owner");
    return data;
  }

  public async constructPrompt(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await this.client.post("/api/orchestrator/phase-1/prompt", input);
    return data;
  }

  public async executeWorker(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await this.client.post("/api/orchestrator/phase-2/execute", input);
    return data;
  }

  public async analyzeError(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await this.client.post("/api/orchestrator/phase-3/analyze", input);
    return data;
  }

  public async validateOutput(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await this.client.post("/api/orchestrator/phase-4/validate", input);
    return data;
  }

  public async orchestrateRun(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data } = await this.client.post("/api/orchestrator/run", input);
    return data;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/health");
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
