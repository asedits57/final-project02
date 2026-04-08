const fs = require('fs');
const path = require('path');

const replacements = [
    [/@shared\/apiClient/g, '@services/apiClient'],
    [/@shared\/api/g, '@services/apiService'],
    [/@shared\/questionService/g, '@services/questionService'],
    [/@core\/authService/g, '@services/authService'],
    [/@core\/userService/g, '@services/userService'],
    [/@modules\/ai\/aiService/g, '@services/aiService'],
    [/@\/core\/useAuthStore/g, '@store/useAuthStore'],
    [/@core\/useAuthStore/g, '@store/useAuthStore'],
    [/@\/shared\/apiClient/g, '@services/apiClient'],
    [/@\/shared\/api/g, '@services/apiService'],
    [/@\/shared\/questionService/g, '@services/questionService'],
    [/@shared\/hooks\//g, '@hooks/'],
    [/@shared\/lib\//g, '@lib/'],
    [/@shared\/utils\//g, '@utils/'],
    [/@shared\/components\/ui\//g, '@components/ui/'],
    [/@shared\/components\/task\//g, '@components/task/'],
    [/@shared\/components\/leaderboard\//g, '@components/leaderboard/'],
    [/@\/shared\/components\/task\//g, '@components/task/'],
    [/@\/shared\/components\/ui\//g, '@components/ui/'],
    [/@shared\/components\/shared\//g, '@components/shared/'],
    [/@\/exam-guardian\/components\//g, '@components/exam/'],
    [/@\/exam-guardian\/pages\//g, '@pages/'],
    [/@\/modules\/ai\/pages\//g, '@pages/'],
    [/@\/modules\/exam\/pages\//g, '@pages/'],
    [/@\/modules\/learning\/pages\//g, '@pages/'],
    [/@\/shared\/pages\//g, '@pages/'],
    [/@\/core\/pages\//g, '@pages/'],
    [/@modules\/learning\/components\//g, '@components/learning/'],
    [/@modules\/exam\/components\//g, '@components/exam/'],
    [/@modules\/ai\/components\//g, '@components/ai/'],
    [/@core\/components\//g, '@components/shared/'],
    [/@modules\/ai\/aiService/g, '@services/aiService'],
    [/@components\/FloatingWord/g, '@components/shared/FloatingWord'],
    [/@components\/AnimatedBackground/g, '@components/shared/AnimatedBackground'],
    [/@components\/Login/g, '@components/shared/Login'],
    [/@components\/NavLink/g, '@components/shared/NavLink'],
    [/@components\/ErrorBoundary/g, '@components/shared/ErrorBoundary'],
    [/@\/store\/useStore/g, '@store/useAuthStore'],
];

const pageSpecificReplacements = {
    'ExamDashboard.tsx': [[/\.\.\/components\//g, '@components/exam/']],
    'Results.tsx': [[/\.\.\/components\//g, '@components/exam/']],
    'GrammarModule.tsx': [[/\.\.\/components\//g, '@components/learning/']],
    'ReadingModule.tsx': [[/\.\.\/components\//g, '@components/learning/']],
    'ListeningModule.tsx': [[/\.\.\/components\//g, '@components/learning/']],
    'SpeakingModule.tsx': [[/\.\.\/components\//g, '@components/learning/']],
    'WritingModule.tsx': [[/\.\.\/components\//g, '@components/learning/']],
    'LearningPage.tsx': [[/\.\.\/components\//g, '@components/learning/']],
    'AITutorPage.tsx': [[/\.\.\/components\//g, '@components/ai/']],
};

function walk(dir) {
    let files = fs.readdirSync(dir);
    files.forEach(file => {
        let filePath = path.join(dir, file);
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            
            // Global replacements
            replacements.forEach(([regex, subst]) => {
                newContent = newContent.replace(regex, subst);
            });

            // File-specific replacements
            const fileName = path.basename(filePath);
            if (pageSpecificReplacements[fileName]) {
                pageSpecificReplacements[fileName].forEach(([regex, subst]) => {
                    newContent = newContent.replace(regex, subst);
                });
            }

            if (newContent !== content) {
                console.log(`Updating imports in ${filePath}`);
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
        }
    });
}

console.log("Starting bulk import updates...");
walk('src');
console.log("Bulk import update completed.");
