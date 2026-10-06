'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TUnitReport } from 'fumadocs-test-reports/tunit/ui';
import type { TUnitReport as TUnitReportData } from 'fumadocs-test-reports/tunit';

export function ReportPage({ report }: { report: TUnitReportData }) {
  const router = useRouter();
  const search = useSearchParams();
  return (
    <TUnitReport
      report={report}
      locale="zh"
      selectedTestId={search.get('test') ?? undefined}
      onTestSelect={(test) => {
        const params = new URLSearchParams(search.toString());
        params.set('test', test.id);
        router.replace(`?${params}`, { scroll: false });
      }}
    />
  );
}
