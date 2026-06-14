"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextStore = exports.ContextStore = void 0;
const deepFreeze = (value) => {
    if (value !== null && typeof value === "object") {
        Object.freeze(value);
        for (const nested of Object.values(value)) {
            deepFreeze(nested);
        }
    }
    return value;
};
class ContextStore {
    constructor() {
        this.context = null;
    }
    setOwnerRequirements(requirements) {
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
    getContext() {
        return this.context;
    }
    reset() {
        this.context = null;
    }
}
exports.ContextStore = ContextStore;
exports.contextStore = new ContextStore();
