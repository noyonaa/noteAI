import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_KEY = 'nayanote-theme';
const MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

export function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light';
  return mode;
}

export function readStoredMode(): ThemeMode {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return MODES.includes(value as ThemeMode) ? (value as ThemeMode) : 'system';
  } catch {
    return 'system'; // storage can be blocked; the UI must still work
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Re-evaluate after the OS theme changes. */
  syncSystem: () => void;
}

export const useTheme = create<ThemeState>((set, get) => {
  const mode = readStoredMode();
  return {
    mode,
    resolved: resolveTheme(mode, systemPrefersDark()),
    setMode: (next) => {
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* non-fatal */
      }
      const resolved = resolveTheme(next, systemPrefersDark());
      applyTheme(resolved);
      set({ mode: next, resolved });
    },
    syncSystem: () => {
      const resolved = resolveTheme(get().mode, systemPrefersDark());
      applyTheme(resolved);
      set({ resolved });
    },
  };
});

/** Call once at startup: applies the theme and follows OS changes while in "system" mode. */
export function initTheme(): () => void {
  applyTheme(useTheme.getState().resolved);
  const query = window.matchMedia?.('(prefers-color-scheme: dark)');
  const onChange = () => useTheme.getState().syncSystem();
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}
