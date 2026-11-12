import { PageHeader } from '../components/layout/PageHeader';
import { ThemeSwitcher } from '../components/layout/ThemeSwitcher';
import { Card } from '../components/ui/Card';
import { useTheme } from '../lib/theme';

export function Settings() {
  const resolved = useTheme((s) => s.resolved);
  return (
    <>
      <PageHeader title="Settings" />
      <Card>
        <h2 className="text-base font-bold">Appearance</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Currently showing the {resolved} theme. "Match system" follows your device and updates automatically.
        </p>
        <ThemeSwitcher />
      </Card>
    </>
  );
}
