import type { TUnitReport } from '../types';
import { Card } from 'fumadocs-ui/components/card';
import { StatusBadge } from '../../ui';
import { getLabels, type TUnitReportLocale } from './labels';
import { displayCounts, runDisplay } from './presentation';

export interface TUnitReportLinkProps {
  report: TUnitReport;
  href: string;
  locale?: TUnitReportLocale;
  className?: string;
}

/** A document reference to a native TUnit report. */
export function TUnitReportLink({
  report,
  href,
  locale = 'en',
  className = '',
}: TUnitReportLinkProps) {
  const labels = getLabels(locale);
  const counts = displayCounts(report);
  return (
    <Card
      className={`ftr-summary ${className}`}
      href={href}
      title={report.assemblyName}
      description={`${counts.passed}/${counts.total} ${labels.passed.toLowerCase()}${report.timestamp ? ` · ${report.timestamp}` : ''}`}
    >
      <div className="ftr-summary-footer">
        <StatusBadge {...runDisplay(report, locale)} />
        <span>{labels.readReport} →</span>
      </div>
    </Card>
  );
}
