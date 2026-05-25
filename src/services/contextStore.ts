import { OwnerRequirements, PersistentContext } from "../types/orchestration";

const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value !== null && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value as Readonly<T>;
};

export class ContextStore {
  private context: PersistentContext | null = null;

  public setOwnerRequirements(requirements: OwnerRequirements): PersistentContext {
    if (this.context?.locked) {
      throw new Error("Owner requirements are locked and cannot be modified.");
    }

    const frozenRequirements = deepFreeze({ ...requirements });
    this.context = {
      ownerRequirements: frozenRequirements,
      createdAt: new Date().toISOString(),
      locked: true,
    };

    return this.context;
  }

  public getContext(): PersistentContext | null {
    return this.context;
  }
}

export const contextStore = new ContextStore();
