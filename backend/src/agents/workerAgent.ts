import { WorkerService } from "../services/workerService";

/**
 * WorkerAgent is the executor.
 * It receives instructions from the OrchestratorAgent,
 * writes code to disk, compiles it, and runs it.
 */
export class WorkerAgent extends WorkerService {}
