import fs from "fs";
import path from "path";

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

const getInlineContent = (filePath, varName) => {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        // Look for the start of the array and capture until the end of the array
        const startMatch = content.indexOf(`const ${varName}`);
        if (startMatch === -1) return [];
        
        const equalsPos = content.indexOf("=", startMatch);
        const arrayStart = content.indexOf("[", equalsPos);
        
        // Find the matching closing bracket
        let depth = 0;
        let arrayEnd = -1;
        for (let i = arrayStart; i < content.length; i++) {
            if (content[i] === "[") depth++;
            if (content[i] === "]") depth--;
            if (depth === 0) {
                arrayEnd = i + 1;
                break;
            }
        }
        
        if (arrayEnd !== -1) {
            const arrayStr = content.slice(arrayStart, arrayEnd);
            return eval(`(${arrayStr})`);
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
console.log("questions.json updated successfully!");
