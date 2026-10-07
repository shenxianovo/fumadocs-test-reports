'use client';

import type { TUnitReport } from '../types';
import { Card } from 'fumadocs-ui/components/card';
import { StatusBadge } from '../../ui';
import { useLabels } from './labels';
import { displayCounts, runDisplay } from './presentation';

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
      title={report.assemblyName}
      description={`${counts.passed}/${counts.total} ${labels.passed.toLowerCase()}${report.timestamp ? ` · ${report.timestamp}` : ''}`}
    >
      <div className="ftr-summary-footer">
        <StatusBadge {...runDisplay(report, labels)} />
        <span>{labels.readReport} →</span>
      </div>
    </Card>
  );
}
