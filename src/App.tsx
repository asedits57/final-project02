import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@components/ui/toaster";
import { Toaster as Sonner } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@components/shared/AuthGuard";
import AdminGuard from "@components/shared/AdminGuard";
import ErrorBoundary from "@components/shared/ErrorBoundary";
import { questionService } from "@services/questionService";
import { preloadAppRoutes } from "@lib/preloadRoutes";

import CompleteGoogleProfilePage from "@pages/CompleteGoogleProfilePage";
import AdminInviteResponsePage from "@pages/AdminInviteResponsePage";
import OAuthCallback from "@pages/OAuthCallback";
import VerifyOtpPage from "@pages/VerifyOtpPage";
import UnifiedAuthPage from "@pages/UnifiedAuthPage";

const HomeWorkspacePage = lazy(() => import("@pages/HomeWorkspacePage"));
const TaskJourneyPage = lazy(() => import("@pages/TaskJourneyPage"));
const PracticeTest = lazy(() => import("@pages/PracticeTest"));
const UnifiedLeaderboardPage = lazy(() => import("@pages/UnifiedLeaderboardPage"));
const NotFound = lazy(() => import("@pages/NotFound"));
const ProfilePage = lazy(() => import("@pages/ProfileStudioPage"));
const SettingsPage = lazy(() => import("@pages/SettingsPage"));
const HelpSupportPage = lazy(() => import("@pages/HelpSupportPage"));
const PrivacyPage = lazy(() => import("@pages/PrivacyPage"));
const GrammarModule = lazy(() => import("@pages/GrammarModule"));
const ReadingModule = lazy(() => import("@pages/ReadingModule"));
const ListeningModule = lazy(() => import("@pages/ListeningModule"));
const SpeakingModule = lazy(() => import("@pages/SpeakingModule"));
const WritingModule = lazy(() => import("@pages/WritingModule"));
const MockTest = lazy(() => import("@pages/MockTest"));
const AITutorPage = lazy(() => import("@pages/AITutorPage"));
const LearningHubPage = lazy(() => import("@pages/LearningHubPage"));
const ExamDashboard = lazy(() => import("@pages/ExamDashboard"));
const Results = lazy(() => import("@pages/Results"));
const AdminDashboard = lazy(() => import("@pages/AdminWorkspacePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
  </div>
);

const App = () => {
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: ["questions"],
      queryFn: questionService.fetchQuestions,
      staleTime: 60 * 60 * 1000,
    });

    const runPreload = () => {
      preloadAppRoutes();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(runPreload, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(runPreload, 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<UnifiedAuthPage />} />
                <Route path="/auth" element={<UnifiedAuthPage />} />
                <Route path="/admin-invite/respond" element={<AdminInviteResponsePage />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/auth/google/callback" element={<OAuthCallback />} />
                <Route path="/verify-otp" element={<AuthGuard><VerifyOtpPage /></AuthGuard>} />
                <Route path="/complete-profile" element={<AuthGuard><CompleteGoogleProfilePage /></AuthGuard>} />
                <Route path="/" element={<AuthGuard><HomeWorkspacePage /></AuthGuard>} />
                <Route path="/task" element={<AuthGuard><TaskJourneyPage /></AuthGuard>} />
                <Route path="/task/practice/:level" element={<AuthGuard><PracticeTest /></AuthGuard>} />
                {/* Module Pages */}
                <Route path="/task/grammar" element={<AuthGuard><GrammarModule /></AuthGuard>} />
                <Route path="/task/reading" element={<AuthGuard><ReadingModule /></AuthGuard>} />
                <Route path="/task/listening" element={<AuthGuard><ListeningModule /></AuthGuard>} />
                <Route path="/task/speaking" element={<AuthGuard><SpeakingModule /></AuthGuard>} />
                <Route path="/task/writing" element={<AuthGuard><WritingModule /></AuthGuard>} />
                <Route path="/task/mock-test" element={<AuthGuard><MockTest /></AuthGuard>} />
                {/* Other Pages */}
                <Route path="/leaderboard" element={<AuthGuard><UnifiedLeaderboardPage /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
                <Route path="/help" element={<AuthGuard><HelpSupportPage /></AuthGuard>} />
                <Route path="/privacy" element={<AuthGuard><PrivacyPage /></AuthGuard>} />
                <Route path="/ai-tutor" element={<AuthGuard><AITutorPage /></AuthGuard>} />
                <Route path="/learning" element={<AuthGuard><LearningHubPage /></AuthGuard>} />
                <Route path="/exam-proctor" element={<AuthGuard><ExamDashboard /></AuthGuard>} />
                <Route path="/exam-results" element={<AuthGuard><Results /></AuthGuard>} />
                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
