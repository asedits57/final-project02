export const ACCESS_TOKEN_STORAGE_KEY = "token";

const normalizeAccessToken = (token: string | null | undefined) => {
  if (!token || token === "undefined") {
    return null;
  }

  return token;
};

const readStoredAccessToken = () =>
  typeof window !== "undefined"
    ? normalizeAccessToken(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
    : null;

const persistAccessToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

let accessToken: string | null = readStoredAccessToken();
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const clearSession = (notify = true) => {
  setAccessToken(null);
  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("session-expired"));
  }
};

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const buildNetworkErrorMessage = (error: unknown, options?: RequestInit) => {
  const payloadLength = typeof options?.body === "string" ? options.body.length : 0;
  const largePayloadHint = payloadLength > 5_000_000;

  if (error instanceof TypeError || error instanceof DOMException) {
    return largePayloadHint
      ? "The request could not be sent. The upload may be too large or the backend connection dropped."
      : "Could not reach the server. Please check that the backend is running and try again.";
  }

  return error instanceof Error ? error.message : "Request failed. Please try again.";
};

export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const makeRequest = async (token: string | null) => {
    const headers = new Headers(options?.headers);
    const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

    if (!headers.has("Content-Type") && !isFormData) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response: Response;

  try {
    response = await makeRequest(getAccessToken());
  } catch (error) {
    throw new Error(buildNetworkErrorMessage(error, options));
  }

  // If 401, attempt to refresh token
  if (response.status === 401 && !endpoint.includes("/auth/refresh-token") && !endpoint.includes("/auth/login")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include"
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAccessToken(data.accessToken);
          isRefreshing = false;
          onTokenRefreshed(getAccessToken()!);

          // Re-attempt original request as the initiator
          const retryRes = await makeRequest(getAccessToken());
          const retryData = await retryRes.json().catch(() => ({}));
          if (!retryRes.ok) {
            if (retryRes.status === 401 || retryRes.status === 403) {
              clearSession();
            }
            throw new Error(retryData.message || retryData.error || "Retry failed");
          }
          return retryData;
        } else {
          isRefreshing = false;
          clearSession();
          throw new Error("Session expired. Please log in again.");
        }
      } catch (err) {
        isRefreshing = false;
        clearSession();
        throw err;
      }
    }

    // Wait for refresh to complete
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(async (token) => {
        try {
          const retryRes = await makeRequest(token);
          const data = await retryRes.json();
          if (!retryRes.ok) {
            if (retryRes.status === 401 || retryRes.status === 403) {
              clearSession();
            }
            throw new Error(data.message || "Retry failed");
          }
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
    if (typeof errorMessage === "string" && errorMessage.startsWith("[")) {
      try {
        const parsed = JSON.parse(errorMessage);
        if (Array.isArray(parsed)) {
          errorMessage = parsed.map((e: { message: string }) => e.message).join(", ");
        }
      } catch (e) { /* ignore */ }
    }
    if (response.status === 401 || response.status === 403) {
      const normalizedMessage = String(errorMessage).toLowerCase();
      if (
        normalizedMessage.includes("session expired") ||
        normalizedMessage.includes("user not found") ||
        normalizedMessage.includes("invalid token") ||
        normalizedMessage.includes("not authorized")
      ) {
        clearSession();
      }
    }
    throw new Error(errorMessage);
  }

  return data;
};

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = readStoredAccessToken();
  }

  return accessToken;
};

export const hasAccessToken = () => !!getAccessToken();

export const setAccessToken = (token: string | null) => {
  accessToken = normalizeAccessToken(token);
  persistAccessToken(accessToken);
};
