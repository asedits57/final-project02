const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'src', 'pages', 'ListeningModule.tsx');
let content = fs.readFileSync(modulePath, 'utf-8');

const regex = /const exercises = \[[\s\S]*?\];\s*(const ListeningModule = \(\) => {)/;

if (regex.test(content)) {
    content = content.replace(regex, 'import { exercises } from "../data/listeningExercises";\n\n$1');
    fs.writeFileSync(modulePath, content, 'utf-8');
    console.log("Updated ListeningModule.tsx successfully via regex!");
} else {
    console.log("Regex did not match.");
}
