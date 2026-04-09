import { authService } from "@services/authService";

const GOOGLE_REDIRECT_URI_STORAGE_KEY = "google_oauth_redirect_uri";

type GoogleOAuthConfig = {
  clientId: string;
  redirectUri: string;
};

const getEnvClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

const getEnvRedirectUri = () =>
  import.meta.env.VITE_GOOGLE_REDIRECT_URI?.trim() || `${window.location.origin}/auth/google/callback`;

export const resolveGoogleOAuthConfig = async (): Promise<GoogleOAuthConfig> => {
  const envClientId = getEnvClientId();
  const envRedirectUri = getEnvRedirectUri();

  try {
    const config = await authService.getGoogleAuthConfig();

    if (config.clientId && config.redirectUri) {
      return {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
      };
    }
  } catch {
    // Fall back to local env values when backend config is temporarily unavailable.
  }

  if (!envClientId) {
    throw new Error(
      "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI in backend/.env.",
    );
  }

  return {
    clientId: envClientId,
    redirectUri: envRedirectUri,
  };
};

export const buildGoogleAuthUrl = ({ clientId, redirectUri }: GoogleOAuthConfig) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: "provider=google",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const storeGoogleRedirectUri = (redirectUri: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(GOOGLE_REDIRECT_URI_STORAGE_KEY, redirectUri);
};

export const getStoredGoogleRedirectUri = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(GOOGLE_REDIRECT_URI_STORAGE_KEY);
};

export const clearStoredGoogleRedirectUri = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(GOOGLE_REDIRECT_URI_STORAGE_KEY);
};
