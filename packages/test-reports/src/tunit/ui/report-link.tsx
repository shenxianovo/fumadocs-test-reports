'use client';

import type { TUnitReport } from '../types';
import { Card } from 'fumadocs-ui/components/card';
import { StatusBadge } from '../../ui';
import { DistributionBar } from '../../ui/run-summary';
import { useLabels } from './labels';
import { displayCounts, runDisplay, statusDisplay } from './presentation';

export interface TUnitReportLinkProps {
  report: TUnitReport;
  href: string;
  className?: string;
}

/** A document reference to a native TUnit report. */
export function TUnitReportLink({ report, href, className = '' }: TUnitReportLinkProps) {
  const labels = useLabels();
  const counts = displayCounts(report);
  return (
    <Card
      className={`ftr-summary ${className}`}
      href={href}
      title={
        <span className="ftr-summary-title">
          <span>{report.assemblyName}</span>
          <StatusBadge {...runDisplay(report, labels)} />
        </span>
      }
    >
      <DistributionBar
        segments={[...counts.byStatus].map(([status, count]) => {
          const mark = statusDisplay(status, labels);
          return { key: status, count, label: mark.status, tone: mark.tone };
        })}
      />
      <div className="ftr-summary-footer">
        <span>
          {counts.passed}/{counts.total} {labels.passed.toLowerCase()}
          {report.timestamp ? ` · ${report.timestamp}` : ''}
        </span>
        <span className="ftr-summary-action">{labels.readReport} →</span>
      </div>
    </Card>
  );
}
