import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { useAuthStore } from "@store/useAuthStore";
import { userService } from "@services/userService";

vi.mock("@services/userService", () => ({
  userService: {
    fetchProfile: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const UseUserProbe = () => {
  const { user, isLoading } = useUser();

  return (
    <div>
      <span data-testid="email">{user?.email || "none"}</span>
      <span data-testid="verified">{String(user?.isVerified)}</span>
      <span data-testid="has-password">{String(user?.hasPassword)}</span>
      <span data-testid="loading">{String(isLoading)}</span>
    </div>
  );
};

describe("useUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    act(() => {
      useAuthStore.setState({ user: null, loading: false, error: null });
    });
  });

  it("prefers the latest store user over stale query data after OTP verification", async () => {
    localStorage.setItem("token", "otp-token");

    vi.mocked(userService.fetchProfile).mockResolvedValue({
      id: "google-user",
      email: "otpuser@gmail.com",
      oauthProvider: "google",
      isVerified: false,
      hasPassword: false,
      score: 0,
      streak: 0,
      level: 1,
    });

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <UseUserProbe />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("email")).toHaveTextContent("otpuser@gmail.com");
      expect(screen.getByTestId("verified")).toHaveTextContent("false");
    });

    act(() => {
      useAuthStore.getState().setUser({
        id: "google-user",
        email: "otpuser@gmail.com",
        oauthProvider: "google",
        isVerified: true,
        hasPassword: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("verified")).toHaveTextContent("true");
      expect(screen.getByTestId("has-password")).toHaveTextContent("false");
    });
  });
});
