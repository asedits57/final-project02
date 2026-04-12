import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Moon,
  Palette,
  Settings,
  Shield,
  Sparkles,
  Sun,
  UserRound,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { Switch } from "@components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@components/ui/toggle-group";
import { useAppearanceStore } from "@store/useAppearanceStore";
import { useAuthStore } from "@store/useAuthStore";

interface ToastState {
  message: string;
  visible: boolean;
}

type AppearanceMode = "light" | "dark" | "custom";

const linkCardClass =
  "group flex w-full items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/5 p-3.5 text-left transition hover:bg-white/8";

const appearanceOptions: Array<{
  value: AppearanceMode;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "custom", label: "Custom", icon: Palette },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const customPalette = useAppearanceStore((state) => state.customPalette);
  const setCustomPalette = useAppearanceStore((state) => state.setCustomPalette);
  const resetCustomPalette = useAppearanceStore((state) => state.resetCustomPalette);
  const isAdmin = user?.role === "admin";

  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [toast, setToast] = useState<ToastState>({ message: "", visible: false });

  const currentTheme: AppearanceMode =
    theme === "light" || theme === "custom" ? theme : "dark";

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 2200);
  };

  const togglePreference = (
    value: boolean,
    setter: (next: boolean) => void,
    label: string,
  ) => {
    setter(!value);
    showToast(`${label} ${!value ? "enabled" : "disabled"}`);
  };

  const handleThemeChange = (value: string) => {
    if (!value) {
      return;
    }

    setTheme(value);
    showToast(`${value.charAt(0).toUpperCase()}${value.slice(1)} mode enabled`);
  };

  const preferenceCards = [
    {
      label: "Sound",
      value: sound ? "Enabled" : "Muted",
      detail: "Audio cues and guided feedback while you practice.",
      icon: Volume2,
      tone: "text-cyan-100",
      current: sound,
      onToggle: () => togglePreference(sound, setSound, "Sound"),
    },
    {
      label: "Notifications",
      value: notifications ? "Active" : "Paused",
      detail: "Live alerts from the platform and admin team.",
      icon: Bell,
      tone: "text-orange-200",
      current: notifications,
      onToggle: () => togglePreference(notifications, setNotifications, "Notifications"),
    },
  ];

  const shortcuts = [
    {
      label: "Profile studio",
      detail: "Return to identity, progress, and next actions.",
      path: "/profile",
      icon: UserRound,
    },
    {
      label: "Privacy and security",
      detail: "Review access, data handling, and policy details.",
      path: "/privacy",
      icon: Shield,
    },
    {
      label: "Help and support",
      detail: "Open troubleshooting, guidance, and support routes.",
      path: "/help",
      icon: HelpCircle,
    },
    {
      label: isAdmin ? "Admin workspace" : "Practice hub",
      detail: isAdmin
        ? "Jump into publishing, invites, and operational tools."
        : "Return to guided practice with your preferences set.",
      path: isAdmin ? "/admin" : "/task",
      icon: isAdmin ? Shield : Sparkles,
    },
  ];

  const handleLogout = async () => {
    await clearUser();
    navigate("/login", { replace: true });
  };

  return (
    <UnifiedPageShell
      eyebrow="Workspace Controls"
      title="Settings"
      description="Adjust appearance and the key workspace preferences here, then jump back into practice without losing context."
      headerAction={
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="brand-button-secondary rounded-full px-4 py-2 text-xs"
        >
          <UserRound className="h-3.5 w-3.5 text-cyan-100" />
          Open Profile
        </button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr,0.95fr]">
        <motion.section
          className="app-surface px-5 py-6 sm:px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="app-kicker">Appearance</span>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Control the page colors directly</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/76">
            Switch between light mode, dark mode, and a custom palette. Custom mode lets you control the page colors instead of using a fixed preset.
          </p>

          <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/5 p-3">
            <ToggleGroup
              type="single"
              value={currentTheme}
              onValueChange={handleThemeChange}
              className="grid grid-cols-3 gap-2"
            >
              {appearanceOptions.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant="outline"
                  className="h-auto rounded-[1rem] border-white/10 px-3 py-3 data-[state=on]:border-cyan-300/24 data-[state=on]:bg-cyan-500/12"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="app-surface-soft p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current mode</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {currentTheme === "light" ? "Light mode" : currentTheme === "dark" ? "Dark mode" : "Custom mode"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300/72">
                Theme changes apply across the shared learner pages immediately.
              </p>
            </div>

            <div className="app-surface-soft p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Preview</p>
              <div className="mt-3 flex gap-2">
                {[
                  { label: "Background", color: customPalette.background },
                  { label: "Surface", color: customPalette.surface },
                  { label: "Primary", color: customPalette.primary },
                  { label: "Accent", color: customPalette.accent },
                ].map((item) => (
                  <div key={item.label} className="flex-1">
                    <div
                      className="h-12 rounded-xl border border-white/10"
                      style={{ backgroundColor: item.color }}
                      aria-label={item.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {currentTheme === "custom" ? (
            <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Custom palette</p>
                  <p className="mt-1 text-xs text-slate-300/72">
                    Choose the page background, card surface, and accent colors for custom mode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetCustomPalette();
                    showToast("Custom colors reset");
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { key: "background" as const, label: "Page background" },
                  { key: "surface" as const, label: "Card surface" },
                  { key: "primary" as const, label: "Primary action" },
                  { key: "accent" as const, label: "Accent tone" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="rounded-[1rem] border border-white/10 bg-white/5 p-3"
                  >
                    <span className="text-xs font-medium text-slate-300/72">{item.label}</span>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={customPalette[item.key]}
                        onChange={(event) => setCustomPalette({ [item.key]: event.target.value })}
                        className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                      />
                      <code className="text-sm text-white">
                        {customPalette[item.key]}
                      </code>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="brand-divider my-5" />

          <div className="grid gap-3">
            {preferenceCards.map(({ label, value, detail, icon: Icon, tone, current, onToggle }) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                      <Icon className={`h-4 w-4 ${tone}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-1 text-xs text-slate-300/72">{detail}</p>
                    </div>
                  </div>

                  <Switch
                    checked={current}
                    onCheckedChange={() => onToggle()}
                    aria-label={label}
                  />
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2 text-xs text-slate-300/75">
                  Current status: {value}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/15"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </motion.section>

        <motion.section
          className="app-surface px-5 py-6 sm:px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <span className="app-kicker">Workspace Access</span>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Keep the important routes close</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/76">
            Settings should stay compact. Update appearance, confirm account state, and jump straight into the next area.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shortcuts.map(({ label, detail, path, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className={linkCardClass}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                    <Icon className="h-4 w-4 text-cyan-100" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300/72">{detail}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="app-surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Account state</p>
              <div className="mt-3 rounded-[1.15rem] border border-white/10 bg-white/5 p-3.5">
                <p className="text-sm font-semibold text-white">{user?.email || "Signed-in learner"}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300/72">
                  {isAdmin
                    ? "Admin privileges are active for this account."
                    : "Learner preferences are active and ready for practice."}
                </p>
              </div>
            </div>

            <div className="app-surface-soft p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                  <Settings className="h-4 w-4 text-orange-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Fast return route</p>
                  <p className="mt-1 text-xs text-slate-300/72">
                    Keep settings as a short stop, then return to the page where the work happens.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(isAdmin ? "/admin" : "/task")}
                className="brand-button-primary mt-4 w-full"
              >
                {isAdmin ? "Open admin workspace" : "Back to practice"}
              </button>
            </div>
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {toast.visible ? (
          <motion.div
            key="settings-toast"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-28 left-1/2 z-[999] -translate-x-1/2 rounded-2xl border border-white/10 bg-[rgba(12,21,36,0.94)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </UnifiedPageShell>
  );
}
