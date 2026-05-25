import { Request, Response } from "express";
import { contextStore } from "../services/contextStore";

export const setOwnerContext = (req: Request, res: Response): void => {
  try {
    const context = contextStore.setOwnerRequirements(req.body);
    res.status(201).json(context);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to set owner context.",
    });
  }
};

export const getOwnerContext = (_req: Request, res: Response): void => {
  const context = contextStore.getContext();
  if (!context) {
    res.status(404).json({ error: "Owner context has not been set." });
    return;
  }

  res.json(context);
};
