import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = fs.readFileSync(path.resolve(__dirname, 'tokens.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf('\n}', start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background] pairs that must hit WCAG AA for normal text (4.5:1)
const TEXT_PAIRS: [string, string][] = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surface-muted'],
  ['text-muted', 'bg'],
  ['text-muted', 'surface'],
  ['text-muted', 'surface-muted'],
  ['text-muted', 'sidebar'],
  ['on-primary', 'primary'],
  ['accent-text', 'surface'],
  ['accent-text', 'sidebar'],
  ['accent-text', 'accent-wash'],
  ['success', 'surface'],
  ['success', 'surface-muted'],
  ['warning', 'surface'],
  ['warning', 'surface-muted'],
  ['danger', 'surface'],
  ['danger', 'surface-muted'],
];

for (const [name, selector] of [['light', ':root'], ['dark', '.dark']] as const) {
  describe(`${name} theme contrast`, () => {
    const t = block(selector);

    it.each(TEXT_PAIRS)('%s on %s meets AA (4.5:1)', (fg, bg) => {
      expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
    });

    it('accent is visible enough for focus rings and markers (3:1)', () => {
      expect(contrast(t.accent, t.bg)).toBeGreaterThanOrEqual(3);
      expect(contrast(t.accent, t.surface)).toBeGreaterThanOrEqual(3);
    });
  });
}
