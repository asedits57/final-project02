import React from "react";
import { render, screen } from "../test/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Leaderboard from "../pages/Leaderboard";
import { useLeaderboard } from "../hooks/useLeaderboard";

vi.mock("@lib/socket", () => ({
  acquireRealtimeSocket: () => null,
  releaseRealtimeSocket: vi.fn(),
}));

vi.mock("../hooks/useLeaderboard", () => ({
  useLeaderboard: vi.fn(),
}));

describe("Leaderboard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render mock users after loading", async () => {
    vi.mocked(useLeaderboard).mockReturnValue({
      data: {
        users: [
          { id: "1", email: "alice@example.com", score: 1500, streak: 4, level: 16, isLive: true, liveModules: ["speaking"] },
          { id: "2", email: "bob@example.com", score: 1200, streak: 2, level: 13, isLive: false, liveModules: [] },
          { id: "3", email: "charlie@example.com", score: 900, streak: 1, level: 10, isLive: false, liveModules: [] },
        ],
        activeUsers: 1,
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof useLeaderboard>);

    render(<Leaderboard />);

    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/charlie/i)).toBeInTheDocument();
    
    expect(screen.getByText(/1,500/i)).toBeInTheDocument();
    expect(screen.getByText(/1,200/i)).toBeInTheDocument();
  });

  it("should handle error state gracefully", async () => {
    vi.mocked(useLeaderboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Failed to load"),
      refetch: vi.fn(),
    } as ReturnType<typeof useLeaderboard>);

    render(<Leaderboard />);

    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
  });
});
