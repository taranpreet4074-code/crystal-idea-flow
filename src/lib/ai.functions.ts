import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { StoryResult } from "./story-types";

const inputSchema = z.object({
  idea: z.string().trim().min(10).max(2000),
  tone: z.string().trim().min(1).max(40),
  audience: z.string().trim().min(1).max(40),
  length: z.enum(["short", "medium", "long"]),
  language: z.string().trim().min(1).max(40).default("English"),
});

const SCENE_TARGET: Record<string, number> = { short: 4, medium: 6, long: 8 };

// Simple in-memory rate limit (per server instance): 10 requests / minute / user.
const hits = new Map<string, number[]>();
function rateLimited(userId: string) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > 10;
}

const storySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "hook",
    "logline",
    "script",
    "scenes",
    "youtube_titles",
    "youtube_description",
    "tags",
    "thumbnail_concepts",
  ],
  properties: {
    title: { type: "string" },
    hook: { type: "string" },
    logline: { type: "string" },
    script: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "title", "narration", "visual_description", "image_prompt", "video_prompt"],
        properties: {
          index: { type: "integer" },
          title: { type: "string" },
          narration: { type: "string" },
          visual_description: { type: "string" },
          image_prompt: { type: "string" },
          video_prompt: { type: "string" },
        },
      },
    },
    youtube_titles: { type: "array", items: { type: "string" } },
    youtube_description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    thumbnail_concepts: { type: "array", items: { type: "string" } },
  },
};

async function callAiGateway(prompt: string, apiKey: string, model: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      text: { format: { type: "json_schema", name: "youtube_story", strict: true, schema: storySchema } },
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    const err = new Error(`ai_gateway_error_${response.status}: ${detail.slice(0, 300)}`);
    (err as Error & { status?: number }).status = response.status;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      for (const line of part.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          } else if (event.type === "response.completed" && event.response?.output_text) {
            if (!text) text = event.response.output_text;
          }
        } catch {
          // ignore keep-alive / non-JSON frames
        }
      }
    }
  }

  return text;
}

/**
 * generateAIResult — validates the user, enforces the plan's monthly limit
 * server-side, calls the AI provider and records the usage + generation.
 */
export const generateAIResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (rateLimited(userId)) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("The AI provider is not configured yet.");
    const model = process.env["AI_MODEL"] ?? "openai/gpt-6-astra";

    // Server-side limit enforcement — cannot be bypassed from the browser.
    const { data: credit, error: creditError } = await supabase.rpc("consume_generation_credit");
    if (creditError) {
      const message = creditError.message || "";
      if (message.includes("limit_reached")) throw new Error("LIMIT_REACHED");
      if (message.includes("account_disabled")) throw new Error("Your account has been disabled.");
      throw new Error("Could not verify your remaining generations. Please try again.");
    }
    const usageRow = Array.isArray(credit) ? credit[0] : credit;

    const scenes = SCENE_TARGET[data.length] ?? 6;
    const prompt = [
      "You are an expert YouTube story producer. Produce a complete, production-ready story package as JSON.",
      `Idea: ${data.idea}`,
      `Tone: ${data.tone}`,
      `Target audience: ${data.audience}`,
      `Target length: ${data.length} (write roughly ${scenes} scenes)`,
      `Language: ${data.language}`,
      "Write a natural spoken-word script, scene-by-scene narration, vivid visual descriptions, and detailed image and video generation prompts for each scene.",
      "Give 5 title options, one YouTube description, 10 tags, and 3 thumbnail concepts.",
    ].join("\n");

    let story: StoryResult;
    try {
      const raw = await callAiGateway(prompt, apiKey, model);
      if (!raw.trim()) throw new Error("empty_response");
      story = JSON.parse(raw) as StoryResult;
    } catch (error) {
      await supabase.rpc("refund_generation_credit");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("generations").insert({
        user_id: userId,
        idea: data.idea,
        options: data,
        status: "failed",
        error_message: String(error).slice(0, 500),
      });
      const status = (error as { status?: number }).status;
      if (status === 429) throw new Error("The AI service is busy right now. Please try again shortly.");
      if (status === 402) throw new Error("AI credits are exhausted. Please contact support.");
      throw new Error("Generation failed. Please try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: userId,
        idea: data.idea,
        options: data,
        result: story as never,
        status: "completed",
      })
      .select("id")
      .single();

    return {
      generationId: inserted?.id ?? null,
      story,
      used: usageRow?.used ?? 0,
      allowed: usageRow?.allowed ?? 0,
    };
  });
