'use client';

import { Card } from 'fumadocs-ui/components/card';
import { StatusBadge } from '../../ui';
import { useReportLabels } from '../../i18n/labels';
import type { VitestJsonReport } from '../types';
import { runDisplay } from './presentation';

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
  return (
    <Card
      className={`ftr-summary ${className}`}
      href={href}
      title={title}
      description={`${report.numPassedTests}/${report.numTotalTests} ${labels.passed.toLowerCase()}`}
    >
      <div className="ftr-summary-footer">
        <StatusBadge {...runDisplay(report, labels)} />
        <span>{labels.readReport} →</span>
      </div>
    </Card>
  );
}
