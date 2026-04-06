import React from "react";
import { render, screen, fireEvent, waitFor } from "../test/testUtils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AITutorPage from "../modules/ai/pages/AITutorPage";
import { apiService as api } from "@shared/api";

// Mock apiService
vi.mock("@shared/api", () => ({
  apiService: {
    askAI: vi.fn(),
  },
}));

describe("AITutorPage Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should send a message and receive an AI response", async () => {
        (api.askAI as any).mockResolvedValue({
            reply: "This is a mock AI response about grammar.",
        });

        render(<AITutorPage />);

        const textarea = screen.getByPlaceholderText(/Ask me anything about English/i);
        const sendButton = screen.getByRole("button", { name: /Send message/i });

        fireEvent.change(textarea, { target: { value: "Tell me about verbs" } });
        fireEvent.click(sendButton);

        // Verify user message displays
        expect(await screen.findByText(/Tell me about verbs/i)).toBeInTheDocument();

        // Verify typing indicator or wait for response
        await waitFor(() => {
            expect(api.askAI).toHaveBeenCalledWith(expect.stringContaining("verbs"));
        });
        
        expect(await screen.findByText(/This is a mock AI response about grammar./i)).toBeInTheDocument();
    });

    it("should handle AI service errors", async () => {
        (api.askAI as any).mockRejectedValue(new Error("Service error"));

        render(<AITutorPage />);

        const textarea = screen.getByPlaceholderText(/Ask me anything about English/i);
        const sendButton = screen.getByRole("button", { name: /Send message/i });

        fireEvent.change(textarea, { target: { value: "Fail me" } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText(/I'm sorry, I'm having trouble connecting to my brain right now/i)).toBeInTheDocument();
        });
    });
});
