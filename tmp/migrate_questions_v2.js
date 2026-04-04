import fs from "fs";
import path from "path";

// Function to extract content from separate files (as before)
const getExportContent = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(/export const \w+(?:\s*:\s*[\w\[\]]+)?\s*=\s*([\s\S]*);/);
        if (match && match[1]) {
            return eval(`(${match[1]})`);
        }
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
    }
    return [];
};

// Function to extract inline variables from a file
const getInlineContent = (filePath, varName) => {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const regex = new RegExp(`const ${varName}(?:\\s*:\\s*[\\w\\[\\]]+)?\\s*=\\s*([\\s\\S]*?);\\n\\n`);
        const match = content.match(regex);
        if (match && match[1]) {
            return eval(`(${match[1]})`);
        }
    } catch (e) {
        console.error(`Error parsing variable ${varName} in ${filePath}:`, e);
    }
    return [];
};

const baseDir = "c:/Users/acer/OneDrive/Desktop/final-project02/src";
const output = {
    grammar: getExportContent(path.join(baseDir, "data", "grammarQuestions.ts")),
    reading: getExportContent(path.join(baseDir, "data", "readingPassages.ts")),
    listening: getExportContent(path.join(baseDir, "data", "listeningExercises.ts")),
    speaking: getExportContent(path.join(baseDir, "data", "speakingPrompts.ts")),
    writing: getExportContent(path.join(baseDir, "data", "writingTasks.ts")),
    practice: getInlineContent(path.join(baseDir, "pages", "PracticeTest.tsx"), "allQuestions"),
    mock: getInlineContent(path.join(baseDir, "pages", "MockTest.tsx"), "questions")
};

fs.writeFileSync(
    "c:/Users/acer/OneDrive/Desktop/final-project02/backend/data/questions.json",
    JSON.stringify(output, null, 2)
);
console.log("questions.json updated with practice and mock questions!");
