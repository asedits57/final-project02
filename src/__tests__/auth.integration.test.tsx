import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@services/authService";
import { apiClient, getAccessToken, hasAccessToken, setAccessToken } from "@services/apiClient";

vi.mock("@services/apiClient", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@services/apiClient")>();

  return {
    ...actual,
    apiClient: vi.fn(),
  };
});

describe("Auth session integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setAccessToken(null);
  });

  it("persists access tokens through the shared session helper", () => {
    setAccessToken("session-token");

    expect(getAccessToken()).toBe("session-token");
    expect(hasAccessToken()).toBe(true);
    expect(localStorage.getItem("token")).toBe("session-token");
  });

  it("stores the login access token centrally through authService", async () => {
    vi.mocked(apiClient).mockResolvedValue({
      success: true,
      accessToken: "mock-token",
      user: { id: "1", email: "test@example.com", score: 0, streak: 0, level: 1 },
    });

    const response = await authService.login("testuser", "password123");

    expect(apiClient).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "testuser", password: "password123" }),
    });
    expect(response.accessToken).toBe("mock-token");
    expect(getAccessToken()).toBe("mock-token");
    expect(localStorage.getItem("token")).toBe("mock-token");
  });
});
/*
import React from "react";
import { render, screen, fireEvent, waitFor } from "../test/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UnifiedAuthPage from "../pages/UnifiedAuthPage";
import { apiService as api } from "@services/apiService";

// Mock Navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock("@lib/authRedirect", () => ({
  getPostLoginPath: (user?: { role?: string }) => (user?.role === "admin" ? "/admin" : "/"),
  preloadPostLoginRoute: vi.fn().mockResolvedValue(undefined),
}));

// Mock apiService
vi.mock("@services/apiService", () => ({
  apiService: {
    login: vi.fn(),
  },
  api: {
    login: vi.fn(),
  },
}));

describe("UnifiedAuthPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should successfully log in and navigate to the home page", async () => {
    (api.login as any).mockResolvedValue({
      success: true,
      accessToken: "mock-token",
      user: { id: "1", email: "test@example.com", username: "testuser" },
    });

    render(<UnifiedAuthPage />);

    // Fill in credentials
    const idInput = screen.getByPlaceholderText(/Your email or username/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const signInButton = screen.getByRole("button", { name: /^Sign in$/i });

    fireEvent.change(idInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith("testuser", "password123");
      expect(localStorage.getItem("token")).toBe("mock-token");
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("should show error message on failed login", async () => {
    (api.login as any).mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });

    render(<UnifiedAuthPage />);

    const idInput = screen.getByPlaceholderText(/Your email or username/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const signInButton = screen.getByRole("button", { name: /^Sign in$/i });

    fireEvent.change(idInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
*/
