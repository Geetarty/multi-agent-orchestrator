"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
class OrchestratorService {
    constructInstructions(input, ownerRequirements) {
        const strategy = this.getRetryStrategy(input.retryCount);
        const relevantSpecSection = this.getRelevantSpecSection(ownerRequirements, input.specSectionFocus);
        const instructions = [
            "You are the worker agent. Modify the code and run it immediately.",
            `Retry count: ${input.retryCount}/${input.maxRetries}`,
            `Strategy: ${strategy}`,
            `Current code state:\n${input.currentCodeState}`,
            `Relevant owner spec section:\n${relevantSpecSection}`,
            `Full error log: ${input.errorLog?.fullLog ?? "None"}`,
            `Line that caused issue: ${input.errorLog?.lineCaused ?? "Unknown"}`,
            "Follow owner constraints exactly. Return structured outputs only.",
        ].join("\n\n");
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
    getRetryStrategy(retryCount) {
        if (retryCount <= 0)
            return "Initial attempt: implement the full solution directly from the owner spec.";
        if (retryCount === 1)
            return "Retry 1: pass the prior error back directly and fix only what failed.";
        return "Retry 2+: identify the root cause and apply a targeted, spec-aligned fix.";
    }
    getRelevantSpecSection(ownerRequirements, focus) {
        if (!focus)
            return ownerRequirements.specificationDetails;
        const normalizedFocus = focus.toLowerCase();
        const allSections = [
            ...ownerRequirements.goals,
            ...ownerRequirements.constraints,
            ...ownerRequirements.acceptanceCriteria,
            ...ownerRequirements.runtimeRequirements,
            ...ownerRequirements.testRequirements,
            ...ownerRequirements.outputFormatExpectations,
            ownerRequirements.specificationDetails,
        ];
        return allSections.find((s) => s.toLowerCase().includes(normalizedFocus)) ?? ownerRequirements.specificationDetails;
    }
}
exports.OrchestratorService = OrchestratorService;
