import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TranslationProvider } from '@fuma-translate/react';
import { defineI18n } from 'fumadocs-core/i18n';
import { describe, expect, it } from 'vitest';
import { VitestReport, VitestReportLink } from '../src/vitest/ui';
import { TUnitReportLink } from '../src/tunit/ui';
import { parseVitestReport } from '../src/vitest';
import { testReportTranslations, zhCN } from '../src/i18n';
import sample from './fixtures/vitest/edge-cases.json';

describe('Vitest JSON presentation', () => {
  it.each([
    ['passed', 'passed', '', true],
    ['passed', 'failed', '', false],
    ['passed', 'skipped', '', false],
    ['passed', 'vendorOutcome', '', false],
    ['failed', 'passed', '', false],
    ['passed', 'passed', 'Collection error', false],
  ])(
    'marks only fully passing files Passed (%s/%s/%s)',
    (fileStatus, testStatus, message, passed) => {
      const report = parseVitestReport({
        ...sample,
        testResults: [
          {
            ...sample.testResults[0],
            status: fileStatus,
            message,
            assertionResults: sample.testResults[0].assertionResults.map((test) => ({
              ...test,
              status: testStatus,
            })),
          },
        ],
      });
      const html = renderToStaticMarkup(createElement(VitestReport, { report }));
      const heading = html.match(/<button[^>]*class="[^"]*ftr-group"[^>]*>(.*?)<\/button>/s)?.[1];
      expect(heading).toBeDefined();
      expect(heading?.includes('ftr-tone-success')).toBe(passed);
    },
  );

  it('starts collapsed, ignores stale selections and supports the host page title', () => {
    const report = parseVitestReport(sample);
    for (const selectedTestId of [undefined, null, 'missing']) {
      const html = renderToStaticMarkup(
        createElement(VitestReport, { report, selectedTestId, showHeader: false }),
      );
      expect(html).not.toContain('aria-expanded="true"');
      expect(html).not.toContain('Cannot import missing-module');
      expect(html).not.toContain('<h2');
    }
  });

  it('shows a file collection failure even when there are no failed test assertions', () => {
    const report = parseVitestReport({
      ...sample,
      numFailedTests: 0,
      testResults: [sample.testResults[2]],
    });
    const html = renderToStaticMarkup(
      createElement(VitestReport, { report, selectedTestId: '0:file' }),
    );
    expect(html).toContain('File error');
    expect(html).toContain('Cannot import missing-module');
    const link = renderToStaticMarkup(createElement(VitestReportLink, { report, href: '/report' }));
    expect(link).toContain('ftr-tone-danger');
    expect(link).not.toContain('ftr-tone-success');
  });
  it('selects duplicate names by position without altering the report', () => {
    const input = structuredClone(sample);
    input.testResults[1].assertionResults[0].duration = 42;
    const report = parseVitestReport(input);
    const before = JSON.stringify(report);
    const html = renderToStaticMarkup(
      createElement(VitestReport, { report, selectedTestId: '1:0' }),
    );
    expect(html).toContain('42.0 ms');
    expect(
      html.match(
        /<button(?=[^>]*class="[^"]*ftr-test(?:\s|"))(?=[^>]*aria-expanded="true")[^>]*>/g,
      ),
    ).toHaveLength(1);
    expect(JSON.stringify(report)).toBe(before);
    expect(report.testResults[1].assertionResults[0]).not.toHaveProperty('id');
  });
  it('escapes failure text and retains unknown outcomes without labeling them passing', () => {
    const report = parseVitestReport(sample);
    const html = renderToStaticMarkup(
      createElement(VitestReport, { report, selectedTestId: '0:1' }),
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('vendorOutcome');
    expect(html).not.toContain('>Traces</button>');
    expect(html).not.toContain('>Attempts</button>');
    const unknown = parseVitestReport({
      ...sample,
      success: true,
      numFailedTests: 0,
      numFailedTestSuites: 0,
      testResults: [sample.testResults[1]],
    });
    expect(
      renderToStaticMarkup(createElement(VitestReportLink, { report: unknown, href: '/report' })),
    ).not.toContain('ftr-tone-success');
  });
  it('does not claim an empty export passed', () => {
    const report = parseVitestReport({
      ...sample,
      success: true,
      numTotalTests: 0,
      numFailedTests: 0,
      numFailedTestSuites: 0,
      testResults: [],
    });
    expect(
      renderToStaticMarkup(createElement(VitestReportLink, { report, href: '/report' })),
    ).toContain('ftr-tone-neutral');
  });
});

describe('host translation provider', () => {
  it('uses one host preset and override across both framework presenters', () => {
    const i18n = defineI18n({ languages: ['en', 'zh'], defaultLanguage: 'en' });
    const translations = i18n
      .translations()
      .extend(testReportTranslations())
      .preset('zh', zhCN())
      .add({ zh: { 'Passed(test reports)': '宿主通过' } });
    const report = parseVitestReport(sample);
    const html = renderToStaticMarkup(
      <TranslationProvider translations={translations.get('zh')}>
        <VitestReport report={report} selectedTestId="0:0" />
        <TUnitReportLink
          report={{
            schemaVersion: 1,
            assemblyName: 'Native title',
            groups: [
              {
                className: 'Tests',
                tests: [{ id: 't', displayName: 'Native test', status: 'passed' }],
              },
            ],
          }}
          href="/tunit"
        />
      </TranslationProvider>,
    );
    expect(html).toContain('宿主通过');
    expect(html).toContain('测试文件');
    expect(html).toContain('查看报告');
    expect(html).toContain('展开全部');
    expect(html).toContain('折叠全部');
    expect(html).toContain('Native title');
    expect(html).toContain('duplicate name');
  });
});
