export type LocalSpellingIssue = {
  word: string;
  suggestion: string;
};

const COMMON_WORDS = new Set([
  "a", "about", "after", "again", "all", "already", "also", "am", "an", "and", "answer", "app",
  "are", "as", "ask", "at", "back", "be", "because", "been", "before", "better", "book", "both",
  "but", "by", "can", "check", "class", "come", "completed", "continue", "correct", "course",
  "day", "daily", "details", "did", "do", "does", "done", "draft", "during", "each", "easy",
  "email", "english", "enough", "error", "every", "exam", "example", "explain", "feature",
  "feedback", "file", "find", "first", "fix", "for", "form", "from", "full", "get", "give",
  "go", "good", "grammar", "great", "group", "guide", "had", "have", "he", "hello", "help",
  "here", "hi", "home", "how", "i", "idea", "if", "improve", "in", "into", "is", "it", "join",
  "just", "keep", "know", "language", "last", "later", "learn", "learning", "lesson", "let",
  "like", "listen", "little", "login", "made", "make", "me", "message", "mistake", "mock",
  "module", "more", "morning", "most", "my", "name", "need", "new", "next", "night", "no",
  "not", "note", "now", "of", "on", "one", "only", "open", "or", "our", "out", "page", "panel",
  "password", "people", "please", "practice", "profile", "progress", "project", "question",
  "questions", "quick", "reading", "real", "record", "request", "review", "right", "save",
  "say", "score", "see", "sentence", "session", "set", "show", "simple", "sing", "sign", "small",
  "so", "some", "something", "speaking", "spelling", "start", "step", "still", "study",
  "submit", "success", "support", "system", "task", "tasks", "teacher", "test", "text", "that",
  "the", "their", "them", "then", "there", "these", "they", "thing", "this", "time", "to",
  "today", "tool", "translate", "try", "two", "understand", "update", "upload", "use", "user",
  "video", "want", "was", "we", "well", "what", "when", "where", "which", "while", "who", "why",
  "will", "with", "word", "work", "working", "writing", "wrong", "you", "your",
]);

const DIRECT_CORRECTIONS: Record<string, string> = {
  ans: "answer",
  becuse: "because",
  chcek: "check",
  chek: "check",
  chwck: "check",
  clas: "class",
  complet: "complete",
  completd: "completed",
  corect: "correct",
  daliy: "daily",
  diferent: "different",
  dont: "don't",
  engish: "english",
  feauter: "feature",
  frend: "friend",
  giv: "give",
  goood: "good",
  gud: "good",
  gudu: "good",
  gudmorning: "good morning",
  hellow: "hello",
  improove: "improve",
  lerning: "learning",
  mesage: "message",
  mornin: "morning",
  mornng: "morning",
  mornning: "morning",
  pleas: "please",
  plese: "please",
  practise: "practice",
  recive: "receive",
  sentense: "sentence",
  singin: "sign in",
  speeling: "spelling",
  studing: "studying",
  thanx: "thanks",
  thier: "their",
  tranlate: "translate",
  translat: "translate",
  welcom: "welcome",
  wrng: "wrong",
  writting: "writing",
};

const tokenize = (text: string) => text.match(/[A-Za-z']+/g) || [];

const normalizeWord = (word: string) => word.toLowerCase().replace(/^'+|'+$/g, "");

const levenshteinDistance = (source: string, target: string) => {
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = source[row - 1] === target[col - 1] ? 0 : 1;

      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[source.length][target.length];
};

const getClosestSuggestion = (word: string) => {
  if (word.length < 4) {
    return null;
  }

  let bestMatch = "";
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of COMMON_WORDS) {
    if (Math.abs(candidate.length - word.length) > 2) {
      continue;
    }

    const distance = levenshteinDistance(word, candidate);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = candidate;
    }
  }

  if (!bestMatch) {
    return null;
  }

  if (bestDistance <= 1) {
    return bestMatch;
  }

  if (bestDistance <= 2 && word.length >= 6) {
    return bestMatch;
  }

  return null;
};

export const findLocalSpellingIssues = (text: string): LocalSpellingIssue[] => {
  const seen = new Set<string>();

  return tokenize(text).flatMap((token) => {
    const normalized = normalizeWord(token);

    if (!normalized || seen.has(normalized) || COMMON_WORDS.has(normalized)) {
      return [];
    }

    let suggestion = DIRECT_CORRECTIONS[normalized];

    if (!suggestion) {
      suggestion = getClosestSuggestion(normalized) || "";
    }

    if (!suggestion || suggestion === normalized) {
      return [];
    }

    seen.add(normalized);
    return [{ word: token, suggestion }];
  });
};

export const mergeSpellingIssues = (
  primary: LocalSpellingIssue[],
  secondary: LocalSpellingIssue[],
) => {
  const merged = new Map<string, LocalSpellingIssue>();

  [...primary, ...secondary].forEach((issue) => {
    const key = normalizeWord(issue.word);
    if (!key || !issue.suggestion.trim()) {
      return;
    }

    if (!merged.has(key)) {
      merged.set(key, {
        word: issue.word,
        suggestion: issue.suggestion.trim(),
      });
    }
  });

  return Array.from(merged.values());
};
