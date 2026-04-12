type GrammarIssue = {
  issue: string;
  suggestion: string;
};

type WritingFeedback = {
  score: number;
  grammar: number;
  vocabulary: number;
  clarity: number;
  suggestions: string[];
};

type SpeakingFeedback = {
  overall: number;
  pronunciation: number;
  fluency: number;
  coherence: number;
  tips: string[];
};

type ListeningReview = {
  message: string;
  tips: string[];
};

const ENGLISH_TO_TAMIL: Record<string, string> = {
  "hello": "வணக்கம்",
  "hi": "வணக்கம்",
  "thank you": "நன்றி",
  "thanks": "நன்றி",
  "good morning": "காலை வணக்கம்",
  "good night": "இனிய இரவு வணக்கம்",
  "how are you": "நீங்கள் எப்படி இருக்கிறீர்கள்?",
  "welcome": "வரவேற்கிறேன்",
  "please": "தயவு செய்து",
};

const TAMIL_TO_ENGLISH: Record<string, string> = {
  "வணக்கம்": "Hello",
  "நன்றி": "Thank you",
  "காலை வணக்கம்": "Good morning",
  "இனிய இரவு வணக்கம்": "Good night",
  "நீங்கள் எப்படி இருக்கிறீர்கள்?": "How are you?",
  "தயவு செய்து": "Please",
};

const COMMON_TEXT_FIXES: Array<[RegExp, string]> = [
  [/\bdont\b/gi, "don't"],
  [/\bcant\b/gi, "can't"],
  [/\bwont\b/gi, "won't"],
  [/\bim\b/gi, "I'm"],
  [/\bive\b/gi, "I've"],
  [/\bid\b/gi, "I'd"],
  [/\bdoesnt\b/gi, "doesn't"],
  [/\bisnt\b/gi, "isn't"],
  [/\barent\b/gi, "aren't"],
  [/\bdidnt\b/gi, "didn't"],
  [/\bshouldnt\b/gi, "shouldn't"],
  [/\bcouldnt\b/gi, "couldn't"],
  [/\bwouldnt\b/gi, "wouldn't"],
];

const SPELLING_FIXES: Record<string, string> = {
  gud: "good",
  gudu: "good",
  gudmorning: "good morning",
  hellow: "hello",
  mornng: "morning",
  mornning: "morning",
  translat: "translate",
  tranlate: "translate",
  sentense: "sentence",
  writting: "writing",
  speeling: "spelling",
  engish: "english",
  practise: "practice",
  pls: "please",
  plese: "please",
  becuse: "because",
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ").trim();

const capitalizeFirst = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

const ensureSentenceEnding = (text: string) =>
  text && !/[.!?]$/.test(text) ? `${text}.` : text;

const extractLastQuotedText = (prompt: string) => {
  const matches = [...prompt.matchAll(/"([^"]*)"/g)];
  const last = matches[matches.length - 1];
  return last?.[1]?.trim() || "";
};

const extractAfterLast = (prompt: string, label: string) => {
  const index = prompt.lastIndexOf(label);
  return index === -1 ? "" : prompt.slice(index + label.length).trim();
};

const tokenizeWords = (text: string) => text.match(/[A-Za-z']+/g) || [];

const getWordCount = (text: string) => tokenizeWords(text).length;

const getSentenceCount = (text: string) => {
  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
  return Math.max(1, sentences.length);
};

const getUniqueWordRatio = (text: string) => {
  const words = tokenizeWords(text).map((word) => word.toLowerCase());
  if (words.length === 0) {
    return 0;
  }

  return new Set(words).size / words.length;
};

const normalizeSentence = (text: string) => {
  let normalized = collapseWhitespace(text).replace(/\bi\b/g, "I");

  for (const [pattern, replacement] of COMMON_TEXT_FIXES) {
    normalized = normalized.replace(pattern, replacement);
  }

  normalized = normalized.replace(/\s+([,.!?])/g, "$1");
  normalized = capitalizeFirst(normalized);
  return ensureSentenceEnding(normalized);
};

const buildGrammarIssues = (text: string): GrammarIssue[] => {
  const trimmed = collapseWhitespace(text);
  const issues: GrammarIssue[] = [];

  if (!trimmed) {
    return issues;
  }

  if (/^[a-z]/.test(trimmed)) {
    issues.push({
      issue: "The sentence should start with a capital letter.",
      suggestion: `Start with "${capitalizeFirst(trimmed).charAt(0)}" instead of a lowercase letter.`,
    });
  }

  if (!/[.!?]$/.test(trimmed)) {
    issues.push({
      issue: "The sentence is missing ending punctuation.",
      suggestion: "Add a period, question mark, or exclamation mark at the end.",
    });
  }

  if (/\bi\b/.test(trimmed)) {
    issues.push({
      issue: 'The pronoun "I" should always be capitalized.',
      suggestion: 'Replace lowercase "i" with uppercase "I".',
    });
  }

  if (/\b(\w+)\s+\1\b/i.test(trimmed)) {
    issues.push({
      issue: "A word is repeated unnecessarily.",
      suggestion: "Remove the repeated word to make the sentence clearer.",
    });
  }

  if (/\s{2,}/.test(text)) {
    issues.push({
      issue: "Extra spaces were detected.",
      suggestion: "Use a single space between words.",
    });
  }

  for (const [pattern, replacement] of COMMON_TEXT_FIXES) {
    if (pattern.test(trimmed)) {
      issues.push({
        issue: `The form matched by "${pattern.source.replace(/\\b/g, "")}" should use an apostrophe.`,
        suggestion: `Use "${replacement}" instead.`,
      });
      break;
    }
  }

  return issues.slice(0, 4);
};

const buildSpellingIssues = (text: string) => {
  const seen = new Set<string>();

  return tokenizeWords(text).flatMap((token) => {
    const normalized = token.toLowerCase();
    const suggestion = SPELLING_FIXES[normalized];

    if (!suggestion || seen.has(normalized)) {
      return [];
    }

    seen.add(normalized);
    return [{ word: token, suggestion }];
  });
};

const buildTranslationReply = (prompt: string) => {
  const match = prompt.match(/Translate the following text from (.+?) to (.+?)\./i);
  const sourceText = extractLastQuotedText(prompt);

  if (!match || !sourceText) {
    return "Translation help is limited right now. Please try a shorter phrase.";
  }

  const fromLanguage = match[1].trim().toLowerCase();
  const toLanguage = match[2].trim().toLowerCase();
  const normalizedSource = sourceText.trim().toLowerCase();

  if (fromLanguage === "english" && toLanguage === "tamil") {
    return ENGLISH_TO_TAMIL[normalizedSource]
      || `Automatic translation is limited right now. Try a shorter English phrase such as "hello", "thank you", or "good morning". Original text: ${sourceText}`;
  }

  if (fromLanguage === "tamil" && toLanguage === "english") {
    return TAMIL_TO_ENGLISH[sourceText.trim()]
      || `Automatic translation is limited right now. Try a shorter Tamil phrase such as "வணக்கம்" or "நன்றி". Original text: ${sourceText}`;
  }

  return `Translation help is limited right now for ${match[1]} to ${match[2]}. Original text: ${sourceText}`;
};

const buildImprovedSentenceReply = (prompt: string) => {
  const sourceText = extractLastQuotedText(prompt);
  return sourceText ? normalizeSentence(sourceText) : "Please enter a sentence to improve.";
};

const buildWritingFeedback = (prompt: string): WritingFeedback => {
  const submission = extractAfterLast(prompt, "Student submission:");
  const wordCount = getWordCount(submission);
  const sentenceCount = getSentenceCount(submission);
  const uniqueWordRatio = getUniqueWordRatio(submission);
  const grammarIssues = buildGrammarIssues(submission);
  const overall = clamp(
    30
      + Math.min(35, wordCount * 1.1)
      + (sentenceCount > 1 ? 8 : 0)
      + (uniqueWordRatio > 0.55 ? 8 : 0)
      - grammarIssues.length * 6,
    20,
    96,
  );

  const suggestions = [
    wordCount < 25
      ? "Add a little more detail so your response feels complete."
      : "Keep supporting your main idea with specific details or examples.",
    grammarIssues.length > 0
      ? "Review capitalization, punctuation, and small grammar fixes before you submit."
      : "Your basic grammar looks steady. Focus on precision and word choice next.",
    uniqueWordRatio < 0.45
      ? "Try using a wider range of vocabulary instead of repeating the same words."
      : "Your vocabulary variety is solid. Continue choosing clear and natural phrases.",
  ];

  return {
    score: overall,
    grammar: clamp(overall - grammarIssues.length * 3, 20, 98),
    vocabulary: clamp(overall + (uniqueWordRatio > 0.55 ? 4 : -4), 20, 98),
    clarity: clamp(overall + (sentenceCount > 1 ? 3 : -5), 20, 98),
    suggestions,
  };
};

const buildSpeakingFeedback = (prompt: string): SpeakingFeedback => {
  const transcript = extractAfterLast(prompt, "Transcript:");
  const wordCount = getWordCount(transcript);
  const sentenceCount = getSentenceCount(transcript);
  const grammarIssues = buildGrammarIssues(transcript);
  const overall = clamp(
    35
      + Math.min(30, wordCount)
      + (sentenceCount > 1 ? 8 : 0)
      - grammarIssues.length * 5,
    25,
    95,
  );

  return {
    overall,
    pronunciation: clamp(overall - 4, 25, 95),
    fluency: clamp(overall + (wordCount >= 20 ? 3 : -3), 25, 95),
    coherence: clamp(overall + (sentenceCount > 1 ? 4 : -4), 25, 95),
    tips: [
      "Speak in short, complete sentences so your ideas sound more organized.",
      "Pause briefly between ideas instead of rushing every word together.",
      grammarIssues.length > 0
        ? "Practice the same response once more and fix the small grammar issues you noticed."
        : "Your structure is fairly clear. Keep practicing stress and rhythm for a smoother delivery.",
    ],
  };
};

const buildListeningReview = (prompt: string): ListeningReview => {
  const scoreMatch = prompt.match(/Score:\s*(\d+)\s*out of 100/i);
  const score = scoreMatch ? Number(scoreMatch[1]) : 0;
  const missed = extractAfterLast(prompt, "Questions the learner missed:");

  let message = "Keep practicing. Focus on key details and signal words in the audio.";
  if (score >= 85) {
    message = "Strong listening work. You are catching both the main idea and supporting details well.";
  } else if (score >= 60) {
    message = "Good effort. You understand the main message, and now you can sharpen your detail tracking.";
  }

  const tips = [
    "Listen for keywords such as names, numbers, time markers, and contrast words like however or but.",
    "Before replaying, predict what kind of information each question is asking for.",
    missed
      ? `Review the missed items one by one: ${missed.split("|").map((item) => item.trim()).filter(Boolean).slice(0, 2).join("; ")}.`
      : "Since you answered everything correctly, challenge yourself to summarize the passage in one or two sentences.",
  ];

  return { message, tips };
};

const buildSupportReply = (prompt: string) => {
  const question = extractAfterLast(prompt, "User issue:").toLowerCase();

  if (question.includes("mic") || question.includes("microphone")) {
    return [
      "Start with the basics:",
      "- Check your browser microphone permission and refresh the page.",
      "- Make sure the correct input device is selected in your system sound settings.",
      "- Close other apps that may be holding the microphone.",
      "",
      "If the level meter still does not move, reconnect the microphone and try again in Chrome or Edge.",
    ].join("\n");
  }

  if (question.includes("progress") || question.includes("save") || question.includes("sync")) {
    return [
      "Try this recovery flow:",
      "- Finish the current activity fully before leaving the page.",
      "- Refresh once and check whether your score or streak updates.",
      "- Sign out and sign back in if the same progress still looks stale.",
      "",
      "If the issue keeps repeating, note which module and task caused it so support can trace it faster.",
    ].join("\n");
  }

  if (question.includes("feedback") || question.includes("ai")) {
    return [
      "AI feedback can sometimes be approximate, so use this check order:",
      "- Compare the feedback against the exact prompt and your final response.",
      "- Focus first on repeated suggestions, because those are usually the most reliable.",
      "- If the advice conflicts with a clear grammar rule, trust the rule and revise manually.",
    ].join("\n");
  }

  if (question.includes("time") || question.includes("timer")) {
    return [
      "For timer pressure, try this:",
      "- Draft a short answer structure before you start writing or speaking.",
      "- Answer the easy parts first so you lock in points quickly.",
      "- Keep sentences simple and complete instead of aiming for perfect complexity.",
    ].join("\n");
  }

  return [
    "Here is a practical support path:",
    "- Refresh the page once and retry the action.",
    "- Check your connection and confirm you are still signed in.",
    "- Note the exact feature, module, and step where the issue appears.",
    "",
    "If you tell me the page and the action that failed, I can narrow the troubleshooting steps further.",
  ].join("\n");
};

const buildModuleCoachReply = (moduleName: string, question: string) => {
  const lowerQuestion = question.toLowerCase();

  if (moduleName === "reading") {
    return [
      "Use a quick reading routine:",
      "- Read the question first so you know what detail to hunt for.",
      "- Skim the paragraph for names, numbers, contrast words, and topic sentences.",
      "- If two options look close, return to the exact sentence and compare wording carefully.",
      "",
      lowerQuestion.includes("summary")
        ? "For a summary, keep the main idea, one key support detail, and no extra examples."
        : "Aim to connect each answer to a specific line in the passage.",
    ].join("\n");
  }

  if (moduleName === "listening") {
    return [
      "Try this listening strategy:",
      "- Predict the type of answer before the audio starts.",
      "- Listen for signal words such as first, however, because, finally, and numbers.",
      "- After each section, restate the main idea in a short phrase.",
      "",
      lowerQuestion.includes("summary")
        ? "Keep your summary to the speaker, topic, and one or two important details."
        : "If you miss one detail, stay calm and keep tracking the next clue.",
    ].join("\n");
  }

  if (moduleName === "grammar") {
    return [
      "Use this grammar check order:",
      "- Find the subject and the main verb first.",
      "- Check tense consistency and subject-verb agreement.",
      "- Then review articles, prepositions, and punctuation.",
      "",
      "If you share one sentence, I can help you correct it step by step.",
    ].join("\n");
  }

  if (moduleName === "writing") {
    return [
      "A strong writing response usually follows this pattern:",
      "- Open with a clear main idea.",
      "- Add one or two supporting details or examples.",
      "- Finish with a short closing sentence.",
      "",
      "Keep your sentences clear before trying to make them complex.",
    ].join("\n");
  }

  if (moduleName === "speaking") {
    return [
      "For speaking, keep your answer easy to follow:",
      "- Start with a direct answer to the prompt.",
      "- Add two supporting points.",
      "- End with a short closing thought.",
      "",
      "Speak a little slower than normal conversation so your words stay clear.",
    ].join("\n");
  }

  return [
    "Focus on the main task goal first.",
    "- Keep your answer short, clear, and organized.",
    "- Use examples only when they support your main point.",
    "- Review your mistakes and try one cleaner second attempt.",
  ].join("\n");
};

const buildTutorReply = (prompt: string) => {
  const studentTurns = prompt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("Student:"));
  const latestQuestion = (studentTurns[studentTurns.length - 1] || "").replace(/^Student:\s*/, "").trim();
  const lowerQuestion = latestQuestion.toLowerCase();

  if (lowerQuestion.includes("present perfect")) {
    return [
      "Present perfect uses have or has plus the past participle.",
      "We use it for life experience, recent results, or actions connected to the present.",
      "",
      "Examples:",
      "- I have finished my homework.",
      "- She has visited Chennai three times.",
      "",
      "Quick tip: do not use a finished past time like yesterday with present perfect.",
    ].join("\n");
  }

  if (lowerQuestion.includes("vocabulary")) {
    return [
      "The fastest way to improve vocabulary is to learn words in context, not alone.",
      "- Write each new word in a short sentence.",
      "- Group words by topic, such as travel, study, or work.",
      "- Review the same words again after one day, three days, and one week.",
      "",
      "Try using one new word three times today in speaking or writing.",
    ].join("\n");
  }

  if (lowerQuestion.includes("pronunciation")) {
    return [
      "For pronunciation improvement, focus on clarity before speed.",
      "- Listen to a short model sentence.",
      "- Repeat it slowly and copy the stress pattern.",
      "- Record yourself and compare the rhythm, not just single sounds.",
      "",
      "Short daily shadowing practice usually works better than long sessions once a week.",
    ].join("\n");
  }

  if (lowerQuestion) {
    return [
      `Here is a clear way to approach "${latestQuestion}":`,
      "- Break the topic into one rule, one example, and one practice sentence.",
      "- Keep your answer simple first, then add detail.",
      "- If you are unsure, compare two example sentences and notice what changes.",
      "",
      "Send me one sample sentence and I can help you improve it.",
    ].join("\n");
  }

  return [
    "I can help with grammar, vocabulary, speaking, listening, or writing.",
    "Ask one specific question or send one sentence, and I will explain it step by step.",
  ].join("\n");
};

const buildGenericEvaluationReply = (prompt: string) => {
  const answer = extractAfterLast(prompt, "User Answer:");
  const grammarIssues = buildGrammarIssues(answer);
  const cleaned = normalizeSentence(answer);

  return [
    "Your answer is understandable and on the right track.",
    grammarIssues.length > 0
      ? "A few quick fixes would make it stronger: check capitalization, punctuation, and sentence flow."
      : "Your sentence structure is fairly clear.",
    `A cleaner version could be: ${cleaned}`,
  ].join("\n");
};

export const buildLocalAIReply = (prompt: string) => {
  const normalizedPrompt = prompt.toLowerCase();

  if (normalizedPrompt.startsWith("translate the following text from ")) {
    return buildTranslationReply(prompt);
  }

  if (normalizedPrompt.startsWith("improve the following english sentence")) {
    return buildImprovedSentenceReply(prompt);
  }

  if (normalizedPrompt.startsWith("check the grammar of the following text")) {
    return JSON.stringify(buildGrammarIssues(extractAfterLast(prompt, 'Text: "').replace(/"$/, "")));
  }

  if (normalizedPrompt.includes("check the spelling of the following text")) {
    return JSON.stringify(buildSpellingIssues(extractAfterLast(prompt, 'Text: "').replace(/"$/, "")));
  }

  if (normalizedPrompt.startsWith("evaluate this english writing response")) {
    return JSON.stringify(buildWritingFeedback(prompt));
  }

  if (normalizedPrompt.startsWith("evaluate this spoken english response")) {
    return JSON.stringify(buildSpeakingFeedback(prompt));
  }

  if (normalizedPrompt.startsWith("you are reviewing a listening exercise")) {
    return JSON.stringify(buildListeningReview(prompt));
  }

  if (normalizedPrompt.includes("you are a support assistant")) {
    return buildSupportReply(prompt);
  }

  if (normalizedPrompt.includes("you are a supportive ai coach for the")) {
    const moduleName = (prompt.match(/supportive ai coach for the (\w+) module/i)?.[1] || "english").toLowerCase();
    const question = extractAfterLast(prompt, "Learner question:");
    return buildModuleCoachReply(moduleName, question);
  }

  if (normalizedPrompt.includes("you are a study coach for the")) {
    const moduleName = (prompt.match(/study coach for the ([a-z]+) area/i)?.[1] || "english").toLowerCase();
    const question = extractAfterLast(prompt, "Learner question:");
    return buildModuleCoachReply(moduleName, question);
  }

  if (normalizedPrompt.includes("you are a friendly english tutor")) {
    return buildTutorReply(prompt);
  }

  if (normalizedPrompt.includes("evaluate the answer and provide constructive feedback")) {
    return buildGenericEvaluationReply(prompt);
  }

  return buildTutorReply(prompt);
};
