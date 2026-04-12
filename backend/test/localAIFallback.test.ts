import { describe, expect, it } from "vitest";
import { buildLocalAIReply } from "../src/utils/localAIFallback";

describe("local AI fallback", () => {
  it("returns valid writing feedback JSON", () => {
    const reply = buildLocalAIReply(
      [
        "Evaluate this English writing response for a learner.",
        'Return only valid JSON with the shape {"score":number,"grammar":number,"vocabulary":number,"clarity":number,"suggestions":["","",""]}.',
        "Scores must be integers from 0 to 100.",
        "Suggestions must be specific, short, encouraging, and actionable.",
        "Task prompt: Describe your city.",
        "Student submission: i like my city because it is clean and friendly",
      ].join("\n\n"),
    );

    const parsed = JSON.parse(reply) as {
      score: number;
      grammar: number;
      vocabulary: number;
      clarity: number;
      suggestions: string[];
    };

    expect(parsed.score).toBeGreaterThan(0);
    expect(parsed.suggestions.length).toBe(3);
  });

  it("returns a tutor answer for present perfect questions", () => {
    const reply = buildLocalAIReply(
      [
        "You are a friendly English tutor. Answer clearly and helpfully.",
        "",
        "Tutor: Hello!",
        "Student: Explain Present Perfect Tense",
        "Tutor:",
      ].join("\n"),
    );

    expect(reply.toLowerCase()).toContain("present perfect");
    expect(reply.toLowerCase()).toContain("have or has");
  });

  it("returns microphone troubleshooting steps for support prompts", () => {
    const reply = buildLocalAIReply(
      [
        "You are a support assistant for an AI-powered English learning platform.",
        "Answer with practical troubleshooting steps, mention product limitations when relevant, and suggest human support only when needed.",
        "User issue: My microphone is not being detected.",
      ].join("\n\n"),
    );

    expect(reply.toLowerCase()).toContain("microphone");
    expect(reply.toLowerCase()).toContain("permission");
  });

  it("returns a direct translation for common English phrases", () => {
    const reply = buildLocalAIReply(
      'Translate the following text from English to Tamil. Return only the translated text, nothing else.\n\n"hello"',
    );

    expect(reply).toBe("வணக்கம்");
  });
});
