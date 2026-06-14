import { Request, Response } from "express";
import { OrchestratorAgent } from "../agents/orchestratorAgent";
import { ValidatorAgent } from "../agents/validatorAgent";
import { WorkerAgent } from "../agents/workerAgent";
import { contextStore } from "../services/contextStore";
import { ErrorAnalysisService } from "../services/errorAnalysisService";
import { claudeFixer } from "../services/claudeFixer";
import { logger } from "../utils/logger";

const orchestratorAgent = new OrchestratorAgent();
const workerAgent = new WorkerAgent();
const validatorAgent = new ValidatorAgent();
const errorAnalysisService = new ErrorAnalysisService();

export const orchestrateRun = async (req: Request, res: Response): Promise<void> => {
  const context = await contextStore.getContext();
  if (!context) {
    res.status(400).json({ error: "Owner context must be set before running orchestration." });
    return;
  }

  let retryCount = Number(req.body.retryCount ?? 0);
  const maxRetries = Number(req.body.maxRetries ?? 3);
  let currentCode = req.body.code;

  logger.info("Orchestration run started", { retryCount, maxRetries });

  const results: any[] = [];

  while (retryCount <= maxRetries) {
    const prompt = orchestratorAgent.constructInstructions(
      {
        currentCodeState: currentCode,
        specSectionFocus: req.body.specSectionFocus,
        errorLog: req.body.errorLog,
        retryCount,
        maxRetries,
      },
      context.ownerRequirements
    );

    const execution = await workerAgent.compileAndRun({
      code: currentCode,
      filename: req.body.filename || "solution.py",
      args: req.body.args,
      timeoutMs: req.body.timeoutMs,
    });

    const validation = validatorAgent.validate(req.body.validationRequest ?? {}, execution);

    const analysis = errorAnalysisService.analyze(execution, validation);

    results.push({
      retryCount,
      prompt,
      execution,
      validation,
      analysis,
      finalCode: currentCode,
    });

    if (execution.run.success && validation.passed) {
      logger.info("Orchestration succeeded", { retryCount });
      res.json({
        results,
        finalStatus: "SUCCESS",
        retryCount,
        escalatedToOwner: false,
      });
      return;
    }

    if (retryCount < maxRetries && !validation.passed) {
      try {
        logger.info("Requesting Claude fix", { retryCount });
        const fixedCode = await claudeFixer.fixCode(
          currentCode,
          analysis.classification,
          analysis.classification,
          context.ownerRequirements.specificationDetails
        );
        currentCode = fixedCode;
        retryCount++;
        logger.info("Claude generated fix, retrying", { retryCount });
      } catch (error) {
        logger.error("Claude fixer failed", { error });
        retryCount++;
      }
    } else {
      retryCount++;
    }
  }

  logger.warn("Orchestration max retries reached", { maxRetries });
  res.json({
    results,
    finalStatus: "ESCALATED",
    retryCount: maxRetries,
    escalatedToOwner: true,
    escalationReason: "Max retries reached without satisfying owner specification.",
  });
};
