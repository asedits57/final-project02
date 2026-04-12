import { useEffect, useState } from "react";

interface DeferredMountOptions {
  delayMs?: number;
  timeoutMs?: number;
}

type IdleCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void;

type IdleAwareWindow = Window & {
  requestIdleCallback?: (callback: IdleCallback, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const useDeferredMount = ({
  delayMs = 0,
  timeoutMs = 800,
}: DeferredMountOptions = {}) => {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount || typeof window === "undefined") {
      return;
    }

    const idleWindow = window as IdleAwareWindow;
    let delayHandle: number | null = null;
    let idleHandle: number | null = null;

    const reveal = () => setShouldMount(true);
    const scheduleIdleWork = () => {
      if (typeof idleWindow.requestIdleCallback === "function") {
        idleHandle = idleWindow.requestIdleCallback(() => reveal(), { timeout: timeoutMs });
        return;
      }

      idleHandle = window.setTimeout(reveal, 0);
    };

    if (delayMs > 0) {
      delayHandle = window.setTimeout(scheduleIdleWork, delayMs);
    } else {
      scheduleIdleWork();
    }

    return () => {
      if (delayHandle !== null) {
        window.clearTimeout(delayHandle);
      }

      if (idleHandle !== null) {
        if (typeof idleWindow.cancelIdleCallback === "function" && typeof idleWindow.requestIdleCallback === "function") {
          idleWindow.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }
    };
  }, [delayMs, shouldMount, timeoutMs]);

  return shouldMount;
};

export default useDeferredMount;
