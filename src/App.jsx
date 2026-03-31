import AuthGuard from "./components/AuthGuard";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <AuthGuard>
            <Dashboard />
        </AuthGuard>
    );
}

export default App;