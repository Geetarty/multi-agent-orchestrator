import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../utils/logger";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class ClaudeFixer {
  async fixCode(
    originalCode: string,
    errorMessage: string,
    errorType: string,
    ownerSpec: string
  ): Promise<string> {
    try {
      const prompt = `You are a Python code fixer. Fix the following code based on the error.

OWNER SPECIFICATION:
${ownerSpec}

ORIGINAL CODE:
\`\`\`python
${originalCode}
\`\`\`

ERROR TYPE: ${errorType}
ERROR MESSAGE: ${errorMessage}

Generate ONLY the corrected Python code. No explanations, no markdown, just the code.`;

      const message = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const fixedCode = message.content[0].type === "text" ? message.content[0].text : "";
      logger.info("Claude generated code fix", { errorType });
      return fixedCode.trim();
    } catch (error) {
      logger.error("Claude fixer error", { error });
      throw error;
    }
  }
}

export const claudeFixer = new ClaudeFixer();
