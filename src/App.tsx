import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import ErrorBoundary from "./components/shared/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const TaskDashboard = lazy(() => import("./pages/TaskDashboard"));
const PracticeTest = lazy(() => import("./pages/PracticeTest"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const HelpSupportPage = lazy(() => import("./pages/HelpSupportPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const GrammarModule = lazy(() => import("./pages/GrammarModule"));
const ReadingModule = lazy(() => import("./pages/ReadingModule"));
const ListeningModule = lazy(() => import("./pages/ListeningModule"));
const SpeakingModule = lazy(() => import("./pages/SpeakingModule"));
const WritingModule = lazy(() => import("./pages/WritingModule"));
const MockTest = lazy(() => import("./pages/MockTest"));
const AITutorPage = lazy(() => import("./pages/AITutorPage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const ExamDashboard = lazy(() => import("./exam-guardian/pages/ExamDashboard"));
const Results = lazy(() => import("./exam-guardian/pages/Results"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));

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
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/auth/google/callback" element={<OAuthCallback />} />
              <Route path="/auth/github/callback" element={<OAuthCallback />} />
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
