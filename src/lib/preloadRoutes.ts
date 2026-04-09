export const preloadHomePage = () => import("@pages/HomeWorkspacePage");

export const preloadAppRoutes = () => {
  void import("@pages/AdminInviteResponsePage");
  void preloadHomePage();
  void import("@pages/TaskJourneyPage");
  void import("@pages/PracticeTest");
  void import("@pages/UnifiedLeaderboardPage");
  void import("@pages/ProfileStudioPage");
  void import("@pages/SettingsPage");
  void import("@pages/HelpSupportPage");
  void import("@pages/PrivacyPage");
  void import("@pages/GrammarModule");
  void import("@pages/ReadingModule");
  void import("@pages/ListeningModule");
  void import("@pages/SpeakingModule");
  void import("@pages/WritingModule");
  void import("@pages/MockTest");
  void import("@pages/AITutorPage");
  void import("@pages/LearningHubPage");
  void import("@pages/ExamDashboard");
  void import("@pages/Results");
  void import("@pages/AdminWorkspacePage");
};
