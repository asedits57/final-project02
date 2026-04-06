let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

const BASE_URL = import.meta.env.VITE_API_URL || "https://your-production-api.com/api/v1";

export const apiClient = async <T = any>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const makeRequest = async (token: string | null) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      credentials: "include",
    });
  };

  let response = await makeRequest(accessToken);

  // If 401, attempt to refresh token
  if (response.status === 401 && !endpoint.includes("/refresh-token") && !endpoint.includes("/login")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/refresh-token`, { 
          method: "POST", 
          credentials: "include" 
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          accessToken = data.accessToken;
          onTokenRefreshed(accessToken!);
          isRefreshing = false;
        } else {
          isRefreshing = false;
          accessToken = null;
          // Redirect to login or handle session expiry
          window.dispatchEvent(new CustomEvent("session-expired"));
          throw new Error("Session expired. Please log in again.");
        }
      } catch (err) {
        isRefreshing = false;
        throw err;
      }
    }

    // Wait for refresh to complete
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(async (token) => {
        try {
          const retryRes = await makeRequest(token);
          const data = await retryRes.json();
          if (!retryRes.ok) throw new Error(data.message || "Retry failed");
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
          errorMessage = parsed.map((e: any) => e.message).join(", ");
        }
      } catch (e) { /* ignore */ }
    }
    throw new Error(errorMessage);
  }

  return data;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
