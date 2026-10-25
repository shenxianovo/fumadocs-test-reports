'use client';

import { Card } from 'fumadocs-ui/components/card';
import { StatusBadge } from '../../ui';
import { DistributionBar } from '../../ui/run-summary';
import { useReportLabels } from '../../i18n/labels';
import type { VitestJsonReport } from '../types';
import { runDisplay, statusDisplay } from './presentation';

export interface VitestReportLinkProps {
  report: VitestJsonReport;
  href: string;
  title?: string;
  className?: string;
}
export function VitestReportLink({
  report,
  href,
  title = 'Vitest',
  className = '',
}: VitestReportLinkProps) {
  const labels = useReportLabels();
  const byStatus = new Map<string, number>();
  for (const test of report.testResults.flatMap((file) => file.assertionResults))
    byStatus.set(test.status, (byStatus.get(test.status) ?? 0) + 1);
  return (
    <Card
      className={`ftr-summary ${className}`}
      href={href}
      title={
        <span className="ftr-summary-title">
          <span>{title}</span>
          <StatusBadge {...runDisplay(report, labels)} />
        </span>
      }
    >
      <DistributionBar
        segments={[...byStatus].map(([status, count]) => {
          const mark = statusDisplay(status, labels);
          return { key: status, count, label: mark.status, tone: mark.tone };
        })}
      />
      <div className="ftr-summary-footer">
        <span>
          {report.numPassedTests}/{report.numTotalTests} {labels.passed.toLowerCase()}
        </span>
        <span className="ftr-summary-action">{labels.readReport} →</span>
      </div>
    </Card>
  );
}
