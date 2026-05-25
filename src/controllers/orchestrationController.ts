import { Request, Response } from "express";
import { OrchestratorAgent } from "../agents/orchestratorAgent";
import { ValidatorAgent } from "../agents/validatorAgent";
import { WorkerAgent } from "../agents/workerAgent";
import { contextStore } from "../services/contextStore";
import { ErrorAnalysisService } from "../services/errorAnalysisService";

const orchestratorAgent = new OrchestratorAgent();
const workerAgent = new WorkerAgent();
const validatorAgent = new ValidatorAgent();
const errorAnalysisService = new ErrorAnalysisService();

export const constructPrompt = (req: Request, res: Response): void => {
  const context = contextStore.getContext();
  if (!context) {
    res.status(400).json({ error: "Owner context must be set before constructing prompts." });
    return;
  }

  const prompt = orchestratorAgent.constructInstructions(req.body, context.ownerRequirements);
  res.json(prompt);
};

export const executeWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await workerAgent.compileAndRun(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Worker execution failed.",
    });
  }
};

export const analyzeError = (req: Request, res: Response): void => {
  const analysis = errorAnalysisService.analyze(req.body.execution, req.body.validation);
  res.json(analysis);
};

export const validateOutput = (req: Request, res: Response): void => {
  const validation = validatorAgent.validate(req.body.request, req.body.execution);
  res.json(validation);
};

export const orchestrateRun = async (req: Request, res: Response): Promise<void> => {
  const context = contextStore.getContext();
  if (!context) {
    res.status(400).json({ error: "Owner context must be set before orchestration." });
    return;
  }

  const retryCount = Number(req.body.retryCount ?? 0);
  const maxRetries = Number(req.body.maxRetries ?? 3);
  const prompt = orchestratorAgent.constructInstructions(
    {
      currentCodeState: req.body.currentCodeState,
      specSectionFocus: req.body.specSectionFocus,
      errorLog: req.body.errorLog,
      retryCount,
      maxRetries,
    },
    context.ownerRequirements,
  );

  const execution = await workerAgent.compileAndRun({
    code: req.body.code,
    filename: req.body.filename,
    args: req.body.args,
    timeoutMs: req.body.timeoutMs,
  });

  const validation = validatorAgent.validate(req.body.validationRequest ?? {}, execution);
  const analysis = errorAnalysisService.analyze(execution, validation);

  const shouldEscalate = retryCount >= maxRetries && (!execution.run.success || !validation.passed);

  res.json({
    prompt,
    execution,
    validation,
    analysis,
    retryCount,
    maxRetries,
    escalatedToOwner: shouldEscalate,
    escalationReason: shouldEscalate ? "Max retries reached without satisfying owner specification." : null,
  });
};
