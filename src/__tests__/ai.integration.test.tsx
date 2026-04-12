import React from "react";
import { render, screen, fireEvent, waitFor } from "../test/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AITutorPage from "../pages/AITutorPage";
import { apiService as api } from "@services/apiService";

// Mock apiService
vi.mock("@services/apiService", () => ({
  apiService: {
    askAI: vi.fn(),
  },
}));

describe("AITutorPage Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should send a message and receive an AI response", async () => {
        vi.mocked(api.askAI).mockResolvedValue({
            reply: "This is a mock AI response about grammar.",
        });

        render(<AITutorPage />);

        const textarea = screen.getByPlaceholderText(/Ask me anything about English/i);

        fireEvent.change(textarea, { target: { value: "Tell me about verbs" } });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Send message/i })).not.toBeDisabled();
        });

        fireEvent.click(screen.getByRole("button", { name: /Send message/i }));

        // Verify user message displays
        await waitFor(() => {
            expect(screen.getByText(/Tell me about verbs/i)).toBeInTheDocument();
        });

        // Verify typing indicator or wait for response
        await waitFor(() => {
            expect(api.askAI).toHaveBeenCalledWith(expect.stringContaining("verbs"));
        });
        
        expect(await screen.findByText(/This is a mock AI response about grammar./i)).toBeInTheDocument();
    });

    it("should handle AI service errors", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(api.askAI).mockRejectedValue(new Error("Service error"));

        render(<AITutorPage />);

        const textarea = screen.getByPlaceholderText(/Ask me anything about English/i);

        fireEvent.change(textarea, { target: { value: "Fail me" } });

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Send message/i })).not.toBeDisabled();
        });

        fireEvent.click(screen.getByRole("button", { name: /Send message/i }));

        await waitFor(() => {
            expect(screen.getByText(/I'm sorry, I'm having trouble connecting to my brain right now/i)).toBeInTheDocument();
        });

        consoleErrorSpy.mockRestore();
    });
});
