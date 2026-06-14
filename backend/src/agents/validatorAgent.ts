import { ValidationService } from "../services/validationService";

/**
 * ValidatorAgent checks worker output against the owner's acceptance criteria.
 * It is the final gate before the orchestrator decides to accept or retry.
 */
export class ValidatorAgent extends ValidationService {}
