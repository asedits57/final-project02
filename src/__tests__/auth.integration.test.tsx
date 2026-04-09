import React from "react";
import { render, screen, fireEvent, waitFor } from "../test/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthPage from "../pages/AuthPage";
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

// Mock apiService
vi.mock("@services/apiService", () => ({
  apiService: {
    login: vi.fn(),
  },
  api: {
    login: vi.fn(),
  },
}));

describe("AuthPage Integration", () => {
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

    render(<AuthPage />);

    // Fill in credentials
    const idInput = screen.getByPlaceholderText(/Your MEC ID/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const signInButton = screen.getByRole("button", { name: /Sign In/i });

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

    render(<AuthPage />);

    const idInput = screen.getByPlaceholderText(/Your MEC ID/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const signInButton = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(idInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
