import { parseTUnitReport } from 'fumadocs-test-reports/tunit';
import { parseVitestReport } from 'fumadocs-test-reports/vitest';
import heartbeat from '../../../packages/test-reports/test/fixtures/heartbeat.tunit-report.json';
import sample from '../fixtures/sample.tunit-report.json';
import fumadocs from '../../../packages/test-reports/test/fixtures/vitest/fumadocs.json';
import vitestSample from '../../../packages/test-reports/test/fixtures/vitest/edge-cases.json';

export const reports = {
  heartbeat: parseTUnitReport(heartbeat),
  sample: parseTUnitReport(sample),
};

export const vitestReports = {
  fumadocs: parseVitestReport(fumadocs),
  'vitest-sample': parseVitestReport(vitestSample),
};
