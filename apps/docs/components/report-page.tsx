'use client';

import { TUnitReport } from 'fumadocs-test-reports/tunit/ui';
import type { TUnitReport as TUnitReportData } from 'fumadocs-test-reports/tunit';
import { useReportSelection } from './use-report-selection';

export function ReportPage({ report }: { report: TUnitReportData }) {
  const { selectedTestId, selectTest } = useReportSelection();
  return (
    <TUnitReport
      report={report}
      showHeader={false}
      selectedTestId={selectedTestId}
      onTestSelect={(test) => selectTest(test?.id)}
    />
  );
}
