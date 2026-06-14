import { Pool } from "pg";
import { OwnerRequirements, PersistentContext } from "../types/orchestration";
import { logger } from "../utils/logger";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5433"),
  database: process.env.DB_NAME || "orchestrator",
  user: process.env.DB_USER || "geetarthmeduri",
});

export class ContextStore {
  public async setOwnerRequirements(requirements: OwnerRequirements): Promise<PersistentContext> {
    try {
      const client = await pool.connect();
      await client.query("DELETE FROM owner_context");
      await client.query(
        "INSERT INTO owner_context (requirements, locked) VALUES ($1, true)",
        [JSON.stringify(requirements)]
      );
      client.release();
      const context: PersistentContext = {
        ownerRequirements: Object.freeze(requirements),
        createdAt: new Date().toISOString(),
        locked: true,
      };
      return context;
    } catch (error) {
      logger.error("Failed to set owner requirements", { error });
      throw error;
    }
  }

  public async getContext(): Promise<PersistentContext | null> {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT requirements FROM owner_context LIMIT 1");
      client.release();
      if (result.rows.length === 0) {
        return null;
      }
      const requirements = result.rows[0].requirements;
      const context: PersistentContext = {
        ownerRequirements: Object.freeze(requirements),
        createdAt: new Date().toISOString(),
        locked: true,
      };
      return context;
    } catch (error) {
      logger.error("Failed to get owner requirements", { error });
      throw error;
    }
  }

  public async reset(): Promise<void> {
    try {
      const client = await pool.connect();
      await client.query("DELETE FROM owner_context");
      client.release();
    } catch (error) {
      logger.error("Failed to reset context", { error });
    }
  }
}

export const contextStore = new ContextStore();
