import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
window.ResizeObserver = ResizeObserver;

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

// Stub framer-motion to avoid animation-related failures in tests
vi.mock("framer-motion", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});
