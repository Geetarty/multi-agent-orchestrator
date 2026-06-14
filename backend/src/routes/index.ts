import { Router } from "express";
import contextRoutes from "./ownerContextRoutes";
import orchestrationRoutes from "./orchestrationRoutes";

const router = Router();

router.use("/context", contextRoutes);
router.use("/orchestrator", orchestrationRoutes);

export default router;
