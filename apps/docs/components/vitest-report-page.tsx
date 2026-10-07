'use client';

import { VitestReport } from 'fumadocs-test-reports/vitest/ui';
import type { VitestJsonReport } from 'fumadocs-test-reports/vitest';
import { useReportSelection } from './use-report-selection';

export function VitestReportPage({ report, title }: { report: VitestJsonReport; title: string }) {
  const { selectedTestId, selectTest } = useReportSelection();
  return (
    <VitestReport
      report={report}
      showHeader={false}
      title={title}
      selectedTestId={selectedTestId}
      onTestSelect={(selection) => selectTest(selection?.id)}
    />
  );
}
