import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/feedback';

/** Honest "not built yet" page. Replaced as each milestone lands. */
export function Placeholder({
  title,
  icon,
  milestone,
  description,
}: {
  title: string;
  icon: IconDefinition;
  milestone: number;
  description: string;
}) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <EmptyState icon={icon} title={`Not built yet: arrives in Milestone ${milestone}`}>
          {description}
        </EmptyState>
      </Card>
    </>
  );
}
