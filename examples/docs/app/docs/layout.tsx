import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={{
        name: 'Test reports',
        children: [
          { type: 'page', name: '接入方式', url: '/docs' },
          { type: 'separator', name: '测试报告' },
          { type: 'page', name: 'Heartbeat 集成测试', url: '/docs/reports/heartbeat' },
          { type: 'page', name: '功能示例数据', url: '/docs/reports/sample' },
          {
            type: 'page',
            name: 'TUnit 原生 HTML ↗',
            url: '/reports/tunit-report.html',
            external: true,
          },
        ],
      }}
      nav={{ title: 'Fumadocs Test Reports', url: '/docs' }}
      searchToggle={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
