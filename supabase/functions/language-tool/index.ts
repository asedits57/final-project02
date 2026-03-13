import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, text, fromLang, toLang, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";

    switch (tool) {
      case "translate":
        systemPrompt = `You are an expert translator from ${fromLang} to ${toLang || "English"}. Translate the following text accurately and naturally. Only return the translated text, nothing else.`;
        break;
      case "grammar":
        systemPrompt = `You are an expert English grammar checker. Analyze the text and return a JSON array of objects with "issue" and "suggestion" fields. Each object describes one grammar issue found. If no issues, return an empty array. Only return valid JSON, nothing else.`;
        break;
      case "improve":
        systemPrompt = `You are an expert English writing coach. Improve the given sentence to sound more natural, polished, and professional. Return only the improved version, nothing else.`;
        break;
      case "spelling":
        systemPrompt = `You are an expert English spelling checker. Find misspelled words and return a JSON array of objects with "word" (the misspelled word) and "suggestion" (the correct spelling). If no errors, return an empty array. Only return valid JSON, nothing else.`;
        break;
      case "tutor":
        systemPrompt = `You are an expert English Tutor. Help the student with their grammar, vocabulary, and general English learning questions. Provide encouraging, clear, and educational responses. Keep your answers concise but comprehensive.`;
        break;
      case "evaluate":
        systemPrompt = `You are an expert English evaluator scoring a spoken response. Analyze the transcribed speech and return a JSON object with two fields: "score" (a number between 0 and 100 indicating overall fluency, grammar, and vocabulary) and "feedback" (a brief string explaining the score and offering 1-2 tips). If the input is empty or unintelligible, give a score of 0. Only return valid JSON, nothing else.`;
        break;
      default:
        throw new Error("Invalid tool specified");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-1.5-flash",
          messages: tool === "tutor" && messages && Array.isArray(messages)
            ? [{ role: "system", content: systemPrompt }, ...messages]
            : [
                { role: "system", content: systemPrompt },
                { role: "user", content: text || " " },
              ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("language-tool error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
