import { Suspense, lazy } from "react";
import { Toaster } from "@components/ui/toaster";
import { Toaster as Sonner } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@components/shared/AuthGuard";
import AdminGuard from "@components/shared/AdminGuard";
import ErrorBoundary from "@components/shared/ErrorBoundary";
import AppRealtimeBridge from "@components/shared/AppRealtimeBridge";
import AppearanceProvider from "@components/shared/AppearanceProvider";

import CompleteGoogleProfilePage from "@pages/CompleteGoogleProfilePage";
import OAuthCallback from "@pages/OAuthCallback";
import VerifyOtpPage from "@pages/VerifyOtpPage";
import UnifiedAuthPage from "@pages/UnifiedAuthPage";

const AdminInviteResponsePage = lazy(() => import("@pages/AdminInviteResponsePage"));
const HomeWorkspacePage = lazy(() => import("@pages/HomeWorkspacePage"));
const TaskJourneyPage = lazy(() => import("@pages/TaskJourneyPage"));
const ManagedTaskPage = lazy(() => import("@pages/ManagedTaskPage"));
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
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRealtimeBridge />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<UnifiedAuthPage />} />
                  <Route path="/login" element={<UnifiedAuthPage />} />
                  <Route path="/auth" element={<UnifiedAuthPage />} />
                  <Route path="/admin-invite/respond" element={<AdminInviteResponsePage />} />
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  <Route path="/auth/google/callback" element={<OAuthCallback />} />
                  <Route path="/verify-otp" element={<AuthGuard><VerifyOtpPage /></AuthGuard>} />
                  <Route path="/complete-profile" element={<AuthGuard><CompleteGoogleProfilePage /></AuthGuard>} />
                  <Route path="/home" element={<AuthGuard><HomeWorkspacePage /></AuthGuard>} />
                  <Route path="/task" element={<AuthGuard><TaskJourneyPage /></AuthGuard>} />
                  <Route path="/task/live/:taskId" element={<AuthGuard><ManagedTaskPage /></AuthGuard>} />
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
      </AppearanceProvider>
    </QueryClientProvider>
  );
};

export default App;
