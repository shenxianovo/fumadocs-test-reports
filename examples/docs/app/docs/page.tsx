import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { TUnitReportLink } from 'fumadocs-test-reports/tunit/ui';
import { reports } from '../../lib/reports';

export default function Page() {
  return (
    <DocsPage
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
      footer={{ enabled: false }}
    >
      <DocsTitle>测试报告</DocsTitle>
      <DocsDescription>把测试结果接入 Fumadocs，并在文档中引用。</DocsDescription>
      <DocsBody>
        <h2>真实测试报告</h2>
        <p>下方引用 Heartbeat 的 TUnit 集成测试结果。点击摘要可查看测试详情、输出和追踪。</p>
        <TUnitReportLink report={reports.heartbeat} href="/docs/reports/heartbeat" locale="zh" />
        <h2>接入方式</h2>
        <CodeBlock>
          <Pre>
            <code>{`import { parseTUnitReport } from 'fumadocs-test-reports/tunit';\nimport { TUnitReport } from 'fumadocs-test-reports/tunit/ui';\nimport reportJson from './run.tunit-report.json';\n\nconst report = parseTUnitReport(reportJson);\n\n<TUnitReport report={report} locale="zh" />`}</code>
          </Pre>
        </CodeBlock>
        <p>在全局样式中导入：</p>
        <CodeBlock>
          <Pre>
            <code>{`@import 'fumadocs-test-reports/css/preset.css';`}</code>
          </Pre>
        </CodeBlock>
        <h2>功能示例</h2>
        <p>这份手写示例数据用于展示失败、重试、跳过、超时和未知状态。</p>
        <TUnitReportLink report={reports.sample} href="/docs/reports/sample" locale="zh" />
        <h2>布局预览</h2>
        <p>报告按内容区域的宽度调整排版。</p>
        <ul>
          {['docs', 'spacious', 'notebook', 'flux', 'glass'].map((name) => (
            <li key={name}>
              <a href={`/layouts/${name}`}>{name}</a>
            </li>
          ))}
        </ul>
      </DocsBody>
    </DocsPage>
  );
}
