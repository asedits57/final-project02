import React from "react";
import { render, screen, waitFor } from "../test/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Leaderboard from "../pages/Leaderboard";
import { userService } from "@services/userService";

vi.mock("@lib/socket", () => ({
  getRealtimeSocket: () => null,
  disconnectRealtimeSocket: vi.fn(),
}));

// Mock userService
vi.mock("@services/userService", () => ({
  userService: {
    fetchLeaderboard: vi.fn(),
  },
}));

describe("Leaderboard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render mock users after loading", async () => {
    (userService.fetchLeaderboard as any).mockResolvedValue({
      users: [
        { id: "1", email: "alice@example.com", score: 1500, streak: 4, level: 16, isLive: true, liveModules: ["speaking"] },
        { id: "2", email: "bob@example.com", score: 1200, streak: 2, level: 13, isLive: false, liveModules: [] },
        { id: "3", email: "charlie@example.com", score: 900, streak: 1, level: 10, isLive: false, liveModules: [] },
      ],
      activeUsers: 1,
      updatedAt: new Date().toISOString(),
    });

    render(<Leaderboard />);

    // Alice should be in the podium or leaderboard list
    // Note: the component splits email to get username
    expect(await screen.findByText(/alice/i)).toBeInTheDocument();
    expect(await screen.findByText(/bob/i)).toBeInTheDocument();
    expect(await screen.findByText(/charlie/i)).toBeInTheDocument();
    
    // Scores are displayed as XP
    expect(screen.getByText(/1,500/i)).toBeInTheDocument();
    expect(screen.getByText(/1,200/i)).toBeInTheDocument();
  });

  it("should handle error state gracefully", async () => {
    (userService.fetchLeaderboard as any).mockRejectedValue(new Error("Failed to load"));

    render(<Leaderboard />);

    await waitFor(() => {
      // In this component, if it fails, it might just show an empty state or remain in loading
      // For now, verified it doesn't crash
      expect(screen.queryByText(/alice/i)).not.toBeInTheDocument();
    });
  });
});
