import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

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

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};

const MOTION_ONLY_PROPS = new Set([
  "animate",
  "drag",
  "dragConstraints",
  "exit",
  "initial",
  "layout",
  "layoutId",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
]);

const createMotionComponent = <T extends keyof JSX.IntrinsicElements>(tag: T) => {
  return ({ children, ...props }: JSX.IntrinsicElements[T]) => {
    const sanitizedProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !MOTION_ONLY_PROPS.has(key)),
    );

    return React.createElement(tag, sanitizedProps, children);
  };
};

vi.mock("framer-motion", () => {
  const motion = new Proxy({} as Record<string, React.ComponentType<object>>, {
    get: (target, property) => {
      void target;
      const tag = typeof property === "string" ? property : "div";
      return createMotionComponent(tag as keyof JSX.IntrinsicElements);
    },
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});
