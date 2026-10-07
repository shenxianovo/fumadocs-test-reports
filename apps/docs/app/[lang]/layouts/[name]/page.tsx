import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import * as DocsLayout from 'fumadocs-ui/layouts/docs';
import * as DocsPage from 'fumadocs-ui/layouts/docs/page';
import * as SpaciousLayout from 'fumadocs-ui/layouts/spacious';
import * as SpaciousPage from 'fumadocs-ui/layouts/spacious/page';
import * as NotebookLayout from 'fumadocs-ui/layouts/notebook';
import * as NotebookPage from 'fumadocs-ui/layouts/notebook/page';
import * as FluxLayout from 'fumadocs-ui/layouts/flux';
import * as FluxPage from 'fumadocs-ui/layouts/flux/page';
import * as GlassLayout from 'fumadocs-ui/layouts/glass';
import * as GlassPage from 'fumadocs-ui/layouts/glass/page';
import { TUnitReportLink } from 'fumadocs-test-reports/tunit/ui';
import { ReportPage } from '../../../../components/report-page';
import { reports } from '../../../../lib/reports';
import { text } from '../../../../lib/i18n';

const layouts = {
  docs: [DocsLayout, DocsPage],
  spacious: [SpaciousLayout, SpaciousPage],
  notebook: [NotebookLayout, NotebookPage],
  flux: [FluxLayout, FluxPage],
  glass: [GlassLayout, GlassPage],
} as const;

export function generateStaticParams() {
  return Object.keys(layouts).map((name) => ({ name }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ name: string; lang: string }>;
}) {
  const { name, lang } = await params;
  if (!Object.hasOwn(layouts, name)) notFound();
  const [layout, page] = layouts[name as keyof typeof layouts];
  const Layout = layout.DocsLayout;
  const { DocsPage, DocsTitle, DocsDescription, DocsBody } = page;

  return (
    <Layout
      i18n
      tree={{
        name: 'Layout examples',
        children: Object.keys(layouts).map((name) => ({
          type: 'page',
          name,
          url: `/${lang}/layouts/${name}`,
        })),
      }}
      nav={{ title: 'Fumadocs Test Reports', url: `/${lang}/docs` }}
      searchToggle={{ enabled: false }}
    >
      <DocsPage full>
        <DocsTitle>
          {name} {text(lang, '布局', 'layout')}
        </DocsTitle>
        <DocsDescription>
          {text(
            lang,
            '同一份报告使用原生布局的宽页模式。',
            'Each native Fumadocs layout shows the same native report in a full-width page.',
          )}
        </DocsDescription>
        <DocsBody>
          <TUnitReportLink report={reports.sample} href={`/${lang}/layouts/${name}?test=failed`} />
          <Suspense fallback={<p>{text(lang, '加载测试报告…', 'Loading report…')}</p>}>
            <ReportPage report={reports.sample} />
          </Suspense>
        </DocsBody>
      </DocsPage>
    </Layout>
  );
}
