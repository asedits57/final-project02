import React, { Suspense, lazy } from "react";
import { Toaster } from "@components/ui/toaster";
import { Toaster as Sonner } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "./core/components/AuthGuard";
import ErrorBoundary from "./shared/components/shared/ErrorBoundary";

const Index = lazy(() => import("./shared/pages/Index"));
const TaskDashboard = lazy(() => import("./shared/pages/TaskDashboard"));
const PracticeTest = lazy(() => import("./modules/exam/pages/PracticeTest"));
const Leaderboard = lazy(() => import("./shared/pages/Leaderboard"));
const NotFound = lazy(() => import("./shared/pages/NotFound"));
const ProfilePage = lazy(() => import("./core/pages/ProfilePage"));
const SettingsPage = lazy(() => import("./shared/pages/SettingsPage"));
const HelpSupportPage = lazy(() => import("./shared/pages/HelpSupportPage"));
const PrivacyPage = lazy(() => import("./shared/pages/PrivacyPage"));
const AuthPage = lazy(() => import("./core/pages/AuthPage"));
const GrammarModule = lazy(() => import("./modules/learning/pages/GrammarModule"));
const ReadingModule = lazy(() => import("./modules/learning/pages/ReadingModule"));
const ListeningModule = lazy(() => import("./modules/learning/pages/ListeningModule"));
const SpeakingModule = lazy(() => import("./modules/learning/pages/SpeakingModule"));
const WritingModule = lazy(() => import("./modules/learning/pages/WritingModule"));
const MockTest = lazy(() => import("./modules/exam/pages/MockTest"));
const AITutorPage = lazy(() => import("./modules/ai/pages/AITutorPage"));
const LearningPage = lazy(() => import("./modules/learning/pages/LearningPage"));
const ExamDashboard = lazy(() => import("./modules/exam/components/exam-guardian/pages/ExamDashboard"));
const Results = lazy(() => import("./modules/exam/components/exam-guardian/pages/Results"));
const AdminDashboard = lazy(() => import("./shared/pages/AdminDashboard"));
const Dashboard = lazy(() => import("./shared/pages/Dashboard"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/task" element={<AuthGuard><TaskDashboard /></AuthGuard>} />
              <Route path="/task/practice/:level" element={<AuthGuard><PracticeTest /></AuthGuard>} />
              {/* Module Pages */}
              <Route path="/task/grammar" element={<AuthGuard><GrammarModule /></AuthGuard>} />
              <Route path="/task/reading" element={<AuthGuard><ReadingModule /></AuthGuard>} />
              <Route path="/task/listening" element={<AuthGuard><ListeningModule /></AuthGuard>} />
              <Route path="/task/speaking" element={<AuthGuard><SpeakingModule /></AuthGuard>} />
              <Route path="/task/writing" element={<AuthGuard><WritingModule /></AuthGuard>} />
              <Route path="/task/mock-test" element={<AuthGuard><MockTest /></AuthGuard>} />
              {/* Other Pages */}
              <Route path="/leaderboard" element={<AuthGuard><Leaderboard /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
              <Route path="/help" element={<AuthGuard><HelpSupportPage /></AuthGuard>} />
              <Route path="/privacy" element={<AuthGuard><PrivacyPage /></AuthGuard>} />
              <Route path="/ai-tutor" element={<AuthGuard><AITutorPage /></AuthGuard>} />
              <Route path="/learning" element={<AuthGuard><LearningPage /></AuthGuard>} />
              <Route path="/exam-proctor" element={<AuthGuard><ExamDashboard /></AuthGuard>} />
              <Route path="/exam-results" element={<AuthGuard><Results /></AuthGuard>} />
              <Route path="/admin" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
