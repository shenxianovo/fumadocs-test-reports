import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { reports } from '../../../../lib/reports';
import { ReportPage } from '../../../../components/report-page';

export function generateStaticParams() {
  return Object.keys(reports).map((name) => ({ name }));
}

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!Object.hasOwn(reports, name)) notFound();
  const report = reports[name as keyof typeof reports];
  return (
    <DocsPage
      full
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      footer={{ enabled: false }}
    >
      <DocsTitle>{name === 'heartbeat' ? 'Heartbeat 集成测试' : '功能示例数据'}</DocsTitle>
      <DocsDescription>
        {name === 'heartbeat' ? 'TUnit 生成的真实运行结果。' : '手写示例数据，用于展示各类结果。'}
      </DocsDescription>
      <Suspense fallback={<p>加载测试报告…</p>}>
        <ReportPage report={report} />
      </Suspense>
    </DocsPage>
  );
}
