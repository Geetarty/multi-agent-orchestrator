import { Router } from "express";
import { analyzeError, constructPrompt, executeWorker, orchestrateRun, validateOutput } from "../controllers/orchestrationController";

const router = Router();

router.post("/phase-1/prompt", constructPrompt);
router.post("/phase-2/execute", executeWorker);
router.post("/phase-3/analyze", analyzeError);
router.post("/phase-4/validate", validateOutput);
router.post("/run", orchestrateRun);

export default router;
