import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { TooltipProvider } from "@components/ui/tooltip";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export const TestProviders = ({ children }: { children: ReactNode }) => {
  const [testQueryClient] = useState(createTestQueryClient);

  return (
    <QueryClientProvider client={testQueryClient}>
      <TooltipProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {children}
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
