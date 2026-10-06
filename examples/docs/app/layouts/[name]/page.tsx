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
import { ReportPage } from '../../../components/report-page';
import { reports } from '../../../lib/reports';

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

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!Object.hasOwn(layouts, name)) notFound();
  const [layout, page] = layouts[name as keyof typeof layouts];
  const Layout = layout.DocsLayout;
  const { DocsPage, DocsTitle, DocsDescription, DocsBody } = page;

  return (
    <Layout
      tree={{
        name: 'Layout examples',
        children: Object.keys(layouts).map((name) => ({
          type: 'page',
          name,
          url: `/layouts/${name}`,
        })),
      }}
      nav={{ title: 'Fumadocs Test Reports', url: '/docs' }}
      searchToggle={{ enabled: false }}
    >
      <DocsPage full>
        <DocsTitle>{name} 布局</DocsTitle>
        <DocsDescription>同一份报告使用原生布局的宽页模式。</DocsDescription>
        <DocsBody>
          <TUnitReportLink
            report={reports.sample}
            href={`/layouts/${name}?test=failed`}
            locale="zh"
          />
          <Suspense fallback={<p>加载测试报告…</p>}>
            <ReportPage report={reports.sample} />
          </Suspense>
        </DocsBody>
      </DocsPage>
    </Layout>
  );
}
