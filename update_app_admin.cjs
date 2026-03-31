const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(modulePath, 'utf-8');

// Add import
const importRegex = /const Results = lazy\(\(\) => import\("\.\/exam-guardian\/pages\/Results"\)\);/;
if (importRegex.test(content)) {
    content = content.replace(importRegex, 'const Results = lazy(() => import("./exam-guardian/pages/Results"));\nconst AdminDashboard = lazy(() => import("./pages/AdminDashboard"));');
}

// Add route
const routeRegex = /<Route path="\/exam-results" element=\{<AuthGuard><Results \/><\/AuthGuard>\} \/>/;
if (routeRegex.test(content)) {
    content = content.replace(routeRegex, '<Route path="/exam-results" element={<AuthGuard><Results /></AuthGuard>} />\n            <Route path="/admin" element={<AuthGuard><AdminDashboard /></AuthGuard>} />');
}

fs.writeFileSync(modulePath, content, 'utf-8');
console.log("Updated App.tsx to include AdminDashboard route.");
