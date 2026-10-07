import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { reports, vitestReports } from '../../../../../lib/reports';
import { ReportPage } from '../../../../../components/report-page';
import { VitestReportPage } from '../../../../../components/vitest-report-page';
import { text } from '../../../../../lib/i18n';
import provenance from '../../../../../../../packages/test-reports/test/fixtures/vitest/provenance.json';

export function generateStaticParams() {
  return [...Object.keys(reports), ...Object.keys(vitestReports)].map((name) => ({ name }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ name: string; lang: string }>;
}) {
  const { name, lang } = await params;
  const isVitest = Object.hasOwn(vitestReports, name);
  if (!isVitest && !Object.hasOwn(reports, name)) notFound();
  const title =
    name === 'fumadocs'
      ? 'Fumadocs · Vitest'
      : name === 'heartbeat'
        ? text(lang, 'Heartbeat 集成测试', 'Heartbeat integration tests')
        : text(lang, '功能示例数据', 'Example data');
  return (
    <DocsPage
      full
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      footer={{ enabled: false }}
    >
      <DocsTitle>{title}</DocsTitle>
      <DocsDescription>
        {name === 'fumadocs'
          ? text(
              lang,
              'Fumadocs 自己的完整测试，由 Vitest 官方 JSON reporter 导出。',
              'This native report contains the complete Fumadocs test run. The official Vitest JSON reporter exported it.',
            )
          : name === 'heartbeat'
            ? text(
                lang,
                'TUnit 生成的真实运行结果。',
                'TUnit exported this native report from a real test run.',
              )
            : text(
                lang,
                '手写示例数据，用于展示各类结果。',
                'Handwritten example data shows different test outcomes.',
              )}
      </DocsDescription>
      {name === 'fumadocs' && (
        <p className="text-sm text-fd-muted-foreground">
          Vitest {provenance.vitestVersion} ·{' '}
          <a href={`https://github.com/fuma-nama/fumadocs/commit/${provenance.commit}`}>
            {provenance.commit.slice(0, 7)}
          </a>
        </p>
      )}
      <Suspense fallback={<p>{text(lang, '加载测试报告…', 'Loading report…')}</p>}>
        {isVitest ? (
          <VitestReportPage
            report={vitestReports[name as keyof typeof vitestReports]}
            title={title}
          />
        ) : (
          <ReportPage report={reports[name as keyof typeof reports]} />
        )}
      </Suspense>
    </DocsPage>
  );
}
