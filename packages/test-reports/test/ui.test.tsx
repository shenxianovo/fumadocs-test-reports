import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TUnitReport, TUnitReportLink } from '../src/tunit/ui';
import { Duration, ErrorDetail, StatusBadge, StdoutPanel } from '../src/ui';
import { parseTUnitReport } from '../src/tunit';
import type { TUnitReport as TUnitReportData } from '../src/tunit';

function run(status = 'passed', extra: Record<string, unknown> = {}): TUnitReportData {
  return parseTUnitReport({
    schemaVersion: 1,
    assemblyName: 'Tests',
    groups: [
      { className: 'Tests', tests: [{ id: 'a', displayName: 'Example', status, ...extra }] },
    ],
  });
}

describe('TUnit presenter', () => {
  it.each([
    ['passed', true],
    ['failed', false],
    ['skipped', false],
    ['vendorOutcome', false],
  ])('marks a group Passed only when every test passed (%s)', (status, passed) => {
    const report = run();
    report.groups[0].tests.push({ id: 'b', displayName: 'Second test', status });
    const html = renderToStaticMarkup(createElement(TUnitReport, { report }));
    const heading = html.match(/<button[^>]*class="[^"]*ftr-group"[^>]*>(.*?)<\/button>/s)?.[1];
    expect(heading).toBeDefined();
    expect(heading?.includes('ftr-tone-success')).toBe(passed);
  });

  it('starts collapsed and opens only an explicit selection', () => {
    const report = run('failed', { exception: { message: 'Native exception detail' } });
    const closed = renderToStaticMarkup(createElement(TUnitReport, { report }));
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).not.toContain('Native exception detail');
    const open = renderToStaticMarkup(createElement(TUnitReport, { report, selectedTestId: 'a' }));
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain('Native exception detail');
  });

  it.each(['failed', 'error', 'timedOut', 'cancelled', 'inProgress', 'vendorOutcome'])(
    'does not label %s as a passing run',
    (status) => {
      const html = renderToStaticMarkup(
        createElement(TUnitReportLink, { report: run(status), href: '/report' }),
      );
      expect(html).not.toContain('ftr-tone-success');
    },
  );

  it('does not label an empty report as passing', () => {
    const report = run();
    report.groups = [];
    expect(
      renderToStaticMarkup(createElement(TUnitReportLink, { report, href: '/report' })),
    ).toContain('ftr-tone-neutral');
  });

  it('honours a producer-reported failure outside the visible passing test list', () => {
    const report = run();
    report.summary = {
      total: 2,
      passed: 1,
      failed: 1,
      skipped: 0,
      cancelled: 0,
      timedOut: 0,
      flaky: 0,
    };
    const html = renderToStaticMarkup(createElement(TUnitReportLink, { report, href: '/report' }));
    expect(html).toContain('ftr-tone-danger');
    expect(html).not.toContain('ftr-tone-success');
  });

  it('renders unknown duration and raw outcome without guessing', () => {
    const html = renderToStaticMarkup(createElement(TUnitReport, { report: run('vendorOutcome') }));
    expect(html).toContain('Unknown');
    expect(html).toContain('vendorOutcome');
    expect(html).not.toContain('0.0 ms');
  });

  it('escapes report-controlled text, including exception messages', () => {
    const html = renderToStaticMarkup(
      createElement(TUnitReport, {
        selectedTestId: 'a',
        report: run('failed', {
          displayName: '<script>alert(1)</script>',
          exception: { message: '<img src=x onerror=alert(1)>' },
        }),
      }),
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
  });

  it('exposes attempts only when the source supplies them', () => {
    const normal = renderToStaticMarkup(createElement(TUnitReport, { report: run() }));
    expect(normal).not.toContain('>Attempts</button>');
    const retried = renderToStaticMarkup(
      createElement(TUnitReport, {
        selectedTestId: 'a',
        report: run('passed', { attempts: [{ status: 'passed', durationMs: 2 }] }),
      }),
    );
    expect(retried).toContain('>Attempts</button>');
  });
});

describe('shared UI primitives', () => {
  it('renders a caller-supplied label without interpreting framework status', () => {
    const html = renderToStaticMarkup(
      createElement(StatusBadge, { status: 'ProviderPaused', tone: 'info' }),
    );
    expect(html).toContain('ProviderPaused');
    expect(html).toContain('ftr-tone-info');
  });
  it('distinguishes missing durations from recorded zero', () => {
    expect(renderToStaticMarkup(createElement(Duration, {}))).toContain('Unknown');
    expect(renderToStaticMarkup(createElement(Duration, { value: null }))).toContain('Unknown');
    expect(renderToStaticMarkup(createElement(Duration, { value: 0 }))).toContain('0.0 ms');
  });
  it('renders escaped error and output strings without any report model', () => {
    const error = renderToStaticMarkup(
      createElement(ErrorDetail, { message: '<script>bad()</script>', stack: '<img src=x>' }),
    );
    const output = renderToStaticMarkup(
      createElement(StdoutPanel, { content: '<script>bad()</script>' }),
    );
    expect(error).toContain('&lt;script&gt;');
    expect(error).toContain('&lt;img');
    expect(output).toContain('&lt;script&gt;');
    expect(error + output).not.toContain('<script>');
  });
});
