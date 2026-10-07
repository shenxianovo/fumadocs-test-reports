import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { TUnitReportLink } from 'fumadocs-test-reports/tunit/ui';
import { VitestReportLink } from 'fumadocs-test-reports/vitest/ui';
import { reports, vitestReports } from '../../../lib/reports';
import { text } from '../../../lib/i18n';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <DocsPage
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      footer={{ enabled: false }}
    >
      <DocsTitle>{text(lang, '测试报告集成', 'Test report integration')}</DocsTitle>
      <DocsDescription>
        {text(
          lang,
          '把原生测试报告接入 Fumadocs，保留各框架的结构和语义。',
          'Read native reports in Fumadocs. Each framework presenter keeps its native report model.',
        )}
      </DocsDescription>
      <DocsBody>
        <h2>{text(lang, '真实测试报告', 'Real native reports')}</h2>
        <p>
          {text(
            lang,
            'Fumadocs 自己的完整测试，由 Vitest 官方 JSON reporter 导出。',
            'This native report contains the complete Fumadocs test run. The official Vitest JSON reporter exported it.',
          )}
        </p>
        <VitestReportLink
          report={vitestReports.fumadocs}
          href={`/${lang}/docs/reports/fumadocs`}
          title="Fumadocs · Vitest"
        />
        <p>
          {text(
            lang,
            'Heartbeat 的 TUnit 集成测试包含输出和追踪。',
            'The Heartbeat native report includes TUnit output and traces.',
          )}
        </p>
        <TUnitReportLink report={reports.heartbeat} href={`/${lang}/docs/reports/heartbeat`} />
        <h2>{text(lang, '接入方式', 'Integration')}</h2>
        <CodeBlock>
          <Pre>
            <code>{`import { parseVitestReport } from 'fumadocs-test-reports/vitest';\nimport { VitestReport } from 'fumadocs-test-reports/vitest/ui';\nimport input from './vitest-report.json';\n\nconst report = parseVitestReport(input);\n<VitestReport report={report} />;`}</code>
          </Pre>
        </CodeBlock>
        <p>
          {text(lang, '在全局样式中导入：', 'Import the stylesheet after your Fumadocs styles:')}
        </p>
        <CodeBlock>
          <Pre>
            <code>{`@import 'fumadocs-test-reports/css/preset.css';`}</code>
          </Pre>
        </CodeBlock>
        <h2>{text(lang, '多语言', 'Internationalization')}</h2>
        <p>
          {text(
            lang,
            '报告界面跟随站点的翻译 Provider；原始测试名称和输出保持不变。',
            'Framework presenters use the host’s translation provider. Native test names and output stay unchanged.',
          )}
        </p>
        <CodeBlock>
          <Pre>
            <code>{`import { testReportTranslations, zhCN } from 'fumadocs-test-reports/i18n';\n\nconst translations = i18n.translations()\n  .extend(uiTranslations())\n  .extend(testReportTranslations())\n  .preset('zh', zhCN());\n\n<RootProvider i18n={i18nProvider(translations, lang)}>\n  {children}\n</RootProvider>;`}</code>
          </Pre>
        </CodeBlock>
        <h2>{text(lang, '边界示例', 'Edge cases')}</h2>
        <p>
          {text(
            lang,
            '下面是单独标记的手写数据，用于验证失败、跳过、未知状态等边界。',
            'These handwritten examples test failures, skipped tests, and unknown outcomes.',
          )}
        </p>
        <VitestReportLink
          report={vitestReports['vitest-sample']}
          href={`/${lang}/docs/reports/vitest-sample`}
          title={text(lang, 'Vitest 边界示例', 'Vitest edge cases')}
        />
        <TUnitReportLink report={reports.sample} href={`/${lang}/docs/reports/sample`} />
        <h2>{text(lang, '布局预览', 'Layout previews')}</h2>
        <ul>
          {['docs', 'spacious', 'notebook', 'flux', 'glass'].map((name) => (
            <li key={name}>
              <a href={`/${lang}/layouts/${name}`}>{name}</a>
            </li>
          ))}
        </ul>
      </DocsBody>
    </DocsPage>
  );
}
