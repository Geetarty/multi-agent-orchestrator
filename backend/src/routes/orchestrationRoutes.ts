import { Router } from "express";
import { orchestrateRun } from "../controllers/orchestrationController";

const router = Router();

router.post("/run", orchestrateRun);

export default router;
