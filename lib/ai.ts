export type AiDraft = {
  summary: string;
  replyDrafts: string[];
  piiMaskSuggestions: string[];
  riskSigns: string[];
  streamSummary: string;
  riskLevel: "low" | "medium" | "high" | "critical";
};

export function isAiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function generateAdminDraft() {
  if (!isAiEnabled()) {
    throw new Error("AI is disabled. Set OPENAI_API_KEY to enable future draft generation.");
  }

  throw new Error("AI draft generation is reserved for a future implementation.");
}
