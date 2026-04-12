import { useEffect, type ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";

import { buildCustomThemeVariables } from "@lib/appearance";
import { useAppearanceStore } from "@store/useAppearanceStore";

const customVariableKeys = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
  "--glow-cyan",
  "--glow-blue",
  "--glow-violet",
  "--sidebar-background",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

const AppearanceSync = ({ children }: { children: ReactNode }) => {
  const { theme, resolvedTheme } = useTheme();
  const customPalette = useAppearanceStore((state) => state.customPalette);

  useEffect(() => {
    const root = document.documentElement;
    const activeTheme = theme === "system" ? (resolvedTheme || "dark") : (theme || "dark");

    if (activeTheme === "custom") {
      const variables = buildCustomThemeVariables(customPalette);

      customVariableKeys.forEach((key) => {
        root.style.setProperty(key, variables[key]);
      });
      root.dataset.surfaceTone = variables.surfaceTone;
    } else {
      customVariableKeys.forEach((key) => {
        root.style.removeProperty(key);
      });
      root.dataset.surfaceTone = activeTheme === "light" ? "light" : "dark";
    }
  }, [customPalette, resolvedTheme, theme]);

  return children;
};

const AppearanceProvider = ({ children }: { children: ReactNode }) => (
  <ThemeProvider
    attribute="data-theme"
    defaultTheme="dark"
    enableSystem={false}
    themes={["dark", "light", "custom"]}
    storageKey="atlas-theme"
  >
    <AppearanceSync>{children}</AppearanceSync>
  </ThemeProvider>
);

export default AppearanceProvider;
