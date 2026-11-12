import { faCircleHalfStroke, faMoon, faSun } from '../../lib/icons';
import { useTheme, type ThemeMode } from '../../lib/theme';
import { IconButton } from '../ui/Button';

const OPTIONS = [
  { mode: 'system', label: 'Match system theme', icon: faCircleHalfStroke },
  { mode: 'light', label: 'Light theme', icon: faSun },
  { mode: 'dark', label: 'Dark theme', icon: faMoon },
] as const satisfies readonly { mode: ThemeMode; label: string; icon: unknown }[];

export function ThemeSwitcher() {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);
  return (
    <div role="group" aria-label="Theme" className="inline-flex gap-1 rounded-card bg-surface-muted p-1">
      {OPTIONS.map((o) => (
        <IconButton
          key={o.mode}
          icon={o.icon}
          label={o.label}
          active={mode === o.mode}
          onClick={() => setMode(o.mode)}
        />
      ))}
    </div>
  );
}
