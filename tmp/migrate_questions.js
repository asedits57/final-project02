import fs from "fs";
import path from "path";

// Function to extract export const/interface content from a file
const getExportContent = (filePath) => {
    const content = fs.readFileSync(filePath, "utf-8");
    // This is a naive way but for these simple data files it should work
    // We'll use regex to get everything after "export const ... ="
    const match = content.match(/export const \w+(?:\s*:\s*[\w\[\]]+)?\s*=\s*([\s\S]*);/);
    if (match && match[1]) {
        try {
            // Evaluated as JS object (risky but okay for internal data migration)
            return eval(`(${match[1]})`);
        } catch (e) {
            console.error(`Error parsing ${filePath}:`, e);
            return [];
        }
    }
    return [];
};

const baseDir = "c:/Users/acer/OneDrive/Desktop/final-project02/src/data";
const output = {
    grammar: getExportContent(path.join(baseDir, "grammarQuestions.ts")),
    reading: getExportContent(path.join(baseDir, "readingPassages.ts")),
    listening: getExportContent(path.join(baseDir, "listeningExercises.ts")),
    speaking: getExportContent(path.join(baseDir, "speakingPrompts.ts")),
    writing: getExportContent(path.join(baseDir, "writingTasks.ts"))
};

fs.writeFileSync(
    "c:/Users/acer/OneDrive/Desktop/final-project02/backend/data/questions.json",
    JSON.stringify(output, null, 2)
);
console.log("questions.json generated successfully!");
