import { Router } from "express";
import { getOwnerContext, setOwnerContext } from "../controllers/contextController";

const router = Router();

router.post("/owner", setOwnerContext);
router.get("/owner", getOwnerContext);

export default router;
