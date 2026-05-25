import { OrchestratorInstructions, OwnerRequirements, PromptConstructionInput } from "../types/orchestration";

export class OrchestratorService {
  public constructInstructions(input: PromptConstructionInput, ownerRequirements: OwnerRequirements): OrchestratorInstructions {
    const strategy = this.getRetryStrategy(input.retryCount);
    const relevantSpecSection = this.getRelevantSpecSection(ownerRequirements, input.specSectionFocus);

    const instructions = [
      "You are the worker agent. Modify code and run it immediately.",
      `Retry count: ${input.retryCount}/${input.maxRetries}`,
      `Strategy: ${strategy}`,
      `Current code state: ${input.currentCodeState}`,
      `Relevant owner spec section: ${relevantSpecSection}`,
      `Full error log: ${input.errorLog?.fullLog ?? "None"}`,
      `Line that caused issue: ${input.errorLog?.lineCaused ?? "Unknown"}`,
      "Follow owner constraints exactly and return structured outputs.",
    ].join("\n");

    return {
      instructions,
      retryCount: input.retryCount,
      maxRetries: input.maxRetries,
      strategy,
      context: {
        currentCodeState: input.currentCodeState,
        relevantSpecSection,
        errorLog: input.errorLog ?? null,
      },
    };
  }

  private getRetryStrategy(retryCount: number): string {
    if (retryCount <= 0) {
      return "Initial attempt: implement full solution from spec.";
    }

    if (retryCount === 1) {
      return "Retry 1: pass prior error back directly and fix only what failed.";
    }

    return "Retry 2+: identify root cause and apply targeted fix aligned with owner spec.";
  }

  private getRelevantSpecSection(ownerRequirements: OwnerRequirements, focus?: string): string {
    if (!focus) {
      return ownerRequirements.specificationDetails;
    }

    const normalizedFocus = focus.toLowerCase();
    const section = [
      ...ownerRequirements.goals,
      ...ownerRequirements.constraints,
      ...ownerRequirements.acceptanceCriteria,
      ...ownerRequirements.runtimeRequirements,
      ...ownerRequirements.testRequirements,
      ...ownerRequirements.outputFormatExpectations,
      ownerRequirements.specificationDetails,
    ].find((value) => value.toLowerCase().includes(normalizedFocus));

    return section ?? ownerRequirements.specificationDetails;
  }
}
