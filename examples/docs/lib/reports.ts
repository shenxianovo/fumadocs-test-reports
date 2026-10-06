import { parseTUnitReport } from 'fumadocs-test-reports/tunit';
import heartbeat from '../../../packages/test-reports/test/fixtures/heartbeat.tunit-report.json';
import sample from '../fixtures/sample.tunit-report.json';

export const reports = {
  heartbeat: parseTUnitReport(heartbeat),
  sample: parseTUnitReport(sample),
};
