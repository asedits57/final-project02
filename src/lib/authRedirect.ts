type AuthRedirectUser = {
  role?: string;
};

export const getPostLoginPath = (user?: AuthRedirectUser | null) => (
  user?.role === "admin" ? "/admin" : "/home"
);

export const preloadPostLoginRoute = async (user?: AuthRedirectUser | null) => {
  try {
    if (user?.role === "admin") {
      await import("@pages/AdminWorkspacePage");
      return;
    }

    await import("@pages/HomeWorkspacePage");
  } catch (error) {
    console.warn("Post-login route preload failed:", error);
  }
};
