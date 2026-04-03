import { toast } from "sonner";

interface LanguageToolRequest {
  tool: "translate" | "grammar" | "improve" | "spelling" | "tutor" | "evaluate";
  text?: string;
  fromLang?: string;
  toLang?: string;
  messages?: { role: string; content: string }[];
}

export async function callLanguageTool({ tool, text, fromLang, toLang, messages }: LanguageToolRequest): Promise<string> {
  return "Language tool is currently offline.";
}
