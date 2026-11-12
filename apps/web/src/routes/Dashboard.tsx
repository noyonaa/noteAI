import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/feedback';
import { fetchHealth } from '../lib/api';

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Dashboard() {
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth, retry: false });

  return (
    <>
      <PageHeader title={greeting()} subtitle="Nayanote is set up. Capture, tasks and the planner arrive in the next milestones." />
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">System status</h2>
          {health.isPending && <Spinner label="Checking" />}
          {health.isError && <Badge tone="danger">Server unreachable</Badge>}
          {health.isSuccess && <Badge tone="success">Server running</Badge>}
        </div>
        {health.isError && (
          <p className="mt-3 text-sm text-muted">
            The local server isn't responding. Start it with <code>npm run dev</code> from the project folder.
          </p>
        )}
        {health.isSuccess && (
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Database</dt>
              <dd className="font-semibold">Local SQLite, {health.data.migrations} migration applied</dd>
            </div>
            <div>
              <dt className="text-muted">AI assistant</dt>
              <dd className="font-semibold">
                {health.data.ai.available ? 'Available' : 'Not configured (everything else works without it)'}
              </dd>
            </div>
          </dl>
        )}
      </Card>
    </>
  );
}
