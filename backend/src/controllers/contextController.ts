import { Request, Response } from "express";
import { contextStore } from "../services/contextStore";
import { logger } from "../utils/logger";

export const setOwnerContext = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = await contextStore.setOwnerRequirements(req.body);
    logger.info("Owner context set and locked.");
    res.status(201).json(context);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to set owner context.",
    });
  }
};

export const getOwnerContext = async (_req: Request, res: Response): Promise<void> => {
  try {
    const context = await contextStore.getContext();
    if (!context) {
      res.status(404).json({ error: "Owner context has not been set." });
      return;
    }
    res.json(context);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get owner context.",
    });
  }
};
