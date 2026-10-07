import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { text } from '../../../lib/i18n';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <DocsLayout
      i18n
      tree={{
        name: text(lang, '测试报告', 'Test reports'),
        children: [
          { type: 'page', name: text(lang, '接入方式', 'Integration'), url: `/${lang}/docs` },
          { type: 'separator', name: text(lang, '测试报告', 'Test reports') },
          { type: 'page', name: 'Fumadocs · Vitest', url: `/${lang}/docs/reports/fumadocs` },
          {
            type: 'page',
            name: text(lang, 'Vitest 原生 HTML ↗', 'Vitest native HTML ↗'),
            url: '/reports/vitest-report.html',
            external: true,
          },
          {
            type: 'page',
            name: 'Vitest · ' + text(lang, '边界示例', 'Edge cases'),
            url: `/${lang}/docs/reports/vitest-sample`,
          },
          {
            type: 'page',
            name: text(lang, 'Heartbeat 集成测试', 'Heartbeat integration tests'),
            url: `/${lang}/docs/reports/heartbeat`,
          },
          {
            type: 'page',
            name: text(lang, 'TUnit 功能示例', 'TUnit examples'),
            url: `/${lang}/docs/reports/sample`,
          },
          {
            type: 'page',
            name: 'TUnit 原生 HTML ↗',
            url: '/reports/tunit-report.html',
            external: true,
          },
        ],
      }}
      nav={{ title: 'Fumadocs Test Reports', url: `/${lang}/docs` }}
      searchToggle={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
