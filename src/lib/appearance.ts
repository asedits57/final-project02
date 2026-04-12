import type { CustomAppearancePalette } from "@store/useAppearanceStore";

interface HslColor {
  h: number;
  s: number;
  l: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeHex = (hex: string) => {
  const value = hex.trim().replace("#", "");
  if (value.length === 3) {
    return value.split("").map((item) => `${item}${item}`).join("");
  }
  return value.padEnd(6, "0").slice(0, 6);
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }): HslColor => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === red) {
      h = ((green - blue) / delta) % 6;
    } else if (max === green) {
      h = (blue - red) / delta + 2;
    } else {
      h = (red - green) / delta + 4;
    }
  }

  return {
    h: Math.round((h * 60 + 360) % 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const toTriplet = ({ h, s, l }: HslColor) => `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;

const withLightness = (color: HslColor, lightness: number, saturationDelta = 0) => ({
  ...color,
  s: clamp(color.s + saturationDelta, 8, 100),
  l: clamp(lightness, 4, 98),
});

const offsetLightness = (color: HslColor, offset: number, saturationDelta = 0) => ({
  ...color,
  s: clamp(color.s + saturationDelta, 8, 100),
  l: clamp(color.l + offset, 4, 98),
});

const getLuminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const toLinear = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

export const isLightHex = (hex: string) => getLuminance(hexToRgb(hex)) > 0.6;

export const buildCustomThemeVariables = (palette: CustomAppearancePalette) => {
  const background = rgbToHsl(hexToRgb(palette.background));
  const surface = rgbToHsl(hexToRgb(palette.surface));
  const primary = rgbToHsl(hexToRgb(palette.primary));
  const accent = rgbToHsl(hexToRgb(palette.accent));
  const lightTone = isLightHex(palette.background);

  const foreground = lightTone ? "220 28% 16%" : "210 22% 96%";
  const secondary = lightTone
    ? toTriplet(withLightness(surface, clamp(surface.l - 7, 84, 92), -12))
    : toTriplet(offsetLightness(surface, 4, -10));
  const muted = lightTone
    ? toTriplet(withLightness(background, clamp(background.l - 6, 82, 90), -20))
    : toTriplet(offsetLightness(background, 8, -12));
  const border = lightTone
    ? toTriplet(withLightness(background, clamp(background.l - 13, 72, 82), -24))
    : toTriplet(offsetLightness(background, 16, -18));
  const input = lightTone
    ? toTriplet(withLightness(surface, clamp(surface.l - 4, 84, 91), -10))
    : toTriplet(offsetLightness(surface, 3, -10));

  return {
    "--background": toTriplet(background),
    "--foreground": foreground,
    "--card": toTriplet(surface),
    "--card-foreground": foreground,
    "--popover": toTriplet(surface),
    "--popover-foreground": foreground,
    "--primary": toTriplet(primary),
    "--primary-foreground": lightTone ? "0 0% 100%" : "214 45% 10%",
    "--secondary": secondary,
    "--secondary-foreground": foreground,
    "--muted": muted,
    "--muted-foreground": lightTone ? "215 14% 40%" : "214 16% 72%",
    "--accent": toTriplet(accent),
    "--accent-foreground": lightTone ? "220 28% 16%" : "214 45% 10%",
    "--border": border,
    "--input": input,
    "--ring": toTriplet(primary),
    "--glow-cyan": toTriplet(primary),
    "--glow-blue": toTriplet(offsetLightness(primary, lightTone ? 4 : 10)),
    "--glow-violet": toTriplet(accent),
    "--sidebar-background": toTriplet(surface),
    "--sidebar-foreground": foreground,
    "--sidebar-primary": toTriplet(primary),
    "--sidebar-primary-foreground": lightTone ? "0 0% 100%" : "214 45% 10%",
    "--sidebar-accent": secondary,
    "--sidebar-accent-foreground": foreground,
    "--sidebar-border": border,
    "--sidebar-ring": toTriplet(primary),
    surfaceTone: lightTone ? "light" : "dark",
  };
};
