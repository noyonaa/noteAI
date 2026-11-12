import { beforeEach, describe, expect, it } from 'vitest';
import { THEME_KEY, readStoredMode, resolveTheme, useTheme } from './theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('resolveTheme', () => {
  it('follows the system only in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('theme persistence', () => {
  it('defaults to system when nothing or garbage is stored', () => {
    expect(readStoredMode()).toBe('system');
    localStorage.setItem(THEME_KEY, 'neon');
    expect(readStoredMode()).toBe('system');
  });

  it('persists the choice and toggles the dark class', () => {
    useTheme.getState().setMode('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    useTheme.getState().setMode('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
