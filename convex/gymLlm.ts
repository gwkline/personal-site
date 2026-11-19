/** Minimal OpenAI-compatible client for the opencode-go subscription.
 * Pattern from plantry's convex/ingest/ai.ts: JSON-mode call, retry with an
 * error hint, and a per-attempt audit log — slimmed to plain fetch so the
 * app adds no new dependency and needs no node runtime.
 *
 * Retry loops here are inherently sequential: each attempt needs the
 * previous one's outcome, so the awaits cannot run in parallel. */

/* eslint-disable no-await-in-loop -- sequential retries by design */

import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

const DEFAULT_BASE_URL = "https://opencode.ai/zen/go/v1";
const DEFAULT_MODEL = "glm-5.3";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800;
// Required by the opencode.ai gateway: routes the request to a session.
const SESSION_HEADER = "x-opencode-session";

export interface LlmMessage {
  role: "system" | "user";
  content: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { completion_tokens?: number; prompt_tokens?: number };
  error?: { message?: string; type?: string };
}

const sleep = (ms: number) =>
  // The promise constructor is the standard sleep; there is no async form.
  // eslint-disable-next-line no-promise-executor-return, promise/avoid-new
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** Parse LLM content into a JSON object; returns the error message instead
 * of throwing so the retry loop can log and hint on failure. Tolerates
 * markdown fences and surrounding commentary before giving up; a truncated
 * response still fails and relies on the retry loop. */
const parseJsonObject = (
  content: string
):
  | { error: string; parsed: null }
  | { error: null; parsed: Record<string, unknown> } => {
  const candidates: string[] = [content];
  const fenced = content.match(/```(?:json)?\s*(?<json>[\s\S]*?)```/u);
  if (fenced?.groups?.json) {
    candidates.push(fenced.groups.json);
  }
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(content.slice(firstBrace, lastBrace + 1));
  }
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim()) as Record<string, unknown>;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return { error: null, parsed };
      }
    } catch {
      // Try the next, more aggressively extracted candidate.
    }
  }
  return { error: "JSON parse failed", parsed: null };
};

const llmConfig = () => ({
  apiKey: process.env.OPENCODE_GO_API_KEY ?? "",
  baseUrl: process.env.LLM_BASE_URL ?? DEFAULT_BASE_URL,
  model: process.env.LLM_MODEL ?? DEFAULT_MODEL,
});

export const coachLlmConfigured = () =>
  llmConfig().apiKey !== "" && llmConfig().baseUrl !== "";

const callOnce = async (
  messages: LlmMessage[],
  model: string
): Promise<ChatCompletionResponse> => {
  const { apiKey, baseUrl } = llmConfig();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    body: JSON.stringify({
      // GLM reasoning can consume the whole budget before it emits the
      // full-plan JSON: 4,096 truncated the draft, and 16,384 still produced
      // empty or incomplete content on adjust calls. Leave room for reasoning
      // plus the seven-day plan; small calls like "today" are unaffected.
      max_tokens: 32_768,
      messages,
      model,
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      [SESSION_HEADER]: `gym-coach-${Date.now()}`,
    },
    method: "POST",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM HTTP ${response.status}: ${body.slice(0, 300)}`);
  }
  return (await response.json()) as ChatCompletionResponse;
};

export interface CoachLlmResult {
  parsed: Record<string, unknown> | null;
  rawResponse: string | null;
  usage: { completionTokens: number | null; promptTokens: number | null };
}

/** Call the coach model and parse its JSON object output. Logs every
 * attempt to gymCoachLogs. Throws only after MAX_ATTEMPTS failures. */
export const callCoachLlm = async (
  ctx: ActionCtx,
  args: {
    kind: "adjust" | "today";
    instruction: string | null;
    messages: LlmMessage[];
  }
): Promise<CoachLlmResult> => {
  const { model } = llmConfig();
  const requestJson = JSON.stringify(args.messages);
  const log = (payload: Record<string, unknown>) =>
    ctx.runMutation(internal.gym.logCoachCall, {
      attempt: payload.attempt as number,
      completionTokens:
        (payload.completionTokens as number | undefined) ?? undefined,
      errorMessage: (payload.errorMessage as string | undefined) ?? undefined,
      instruction: args.instruction ?? undefined,
      kind: args.kind,
      model,
      promptTokens: (payload.promptTokens as number | undefined) ?? undefined,
      requestJson,
      responseJson: (payload.responseJson as string | undefined) ?? undefined,
      status: payload.status as string,
    });

  let lastError = "LLM call failed";
  let messages = [...args.messages];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await callOnce(messages, model);
      const content = response.choices?.[0]?.message?.content ?? "";
      const usage = {
        completionTokens: response.usage?.completion_tokens ?? null,
        promptTokens: response.usage?.prompt_tokens ?? null,
      };
      const parsedResult = parseJsonObject(content);
      if (parsedResult.error === null) {
        await log({
          attempt,
          completionTokens: usage.completionTokens ?? undefined,
          promptTokens: usage.promptTokens ?? undefined,
          responseJson: content.slice(0, 20_000),
          status: "success",
        });
        return { parsed: parsedResult.parsed, rawResponse: content, usage };
      }
      lastError = parsedResult.error;
      await log({
        attempt,
        completionTokens: usage.completionTokens ?? undefined,
        errorMessage: lastError,
        promptTokens: usage.promptTokens ?? undefined,
        responseJson: content.slice(0, 2000),
        status: "error",
      });
      messages = [
        ...args.messages,
        {
          content: `That response was not valid JSON. Reply again with a single JSON object matching the contract, no markdown fences, no commentary.`,
          role: "user" as const,
        },
      ];
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown LLM error";
      await log({
        attempt,
        errorMessage: lastError,
        status: "error",
      });
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw new Error(lastError);
};

// bundle nudge
