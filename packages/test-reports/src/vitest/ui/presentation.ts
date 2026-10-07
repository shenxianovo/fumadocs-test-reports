import type { BadgeTone } from '../../ui';
import type { ReportLabels } from '../../i18n/labels';
import type { VitestJsonReport } from '../types';

/** Display decisions for Vitest JSON only. */
export function statusDisplay(status: string, labels: ReportLabels) {
  const tone: BadgeTone =
    status === 'passed' ? 'success' : status === 'failed' ? 'danger' : 'neutral';
  return {
    status: Object.hasOwn(labels.statuses, status) ? labels.statuses[status] : status,
    tone,
  };
}
export function runDisplay(report: VitestJsonReport, labels: ReportLabels) {
  if (
    !report.success ||
    report.numFailedTests > 0 ||
    report.numFailedTestSuites > 0 ||
    report.testResults.some(
      (file) =>
        file.status === 'failed' ||
        file.message ||
        file.assertionResults.some((test) => test.status === 'failed'),
    )
  )
    return statusDisplay('failed', labels);
  const tests = report.testResults.flatMap((file) => file.assertionResults);
  if (
    report.numTotalTests === 0 ||
    report.testResults.some((file) => !['passed', 'failed'].includes(file.status)) ||
    tests.some(
      (test) =>
        !['passed', 'failed', 'skipped', 'pending', 'todo', 'disabled'].includes(test.status),
    )
  )
    return statusDisplay('unknown', labels);
  return statusDisplay(report.numPassedTests > 0 ? 'passed' : 'pending', labels);
}
export function runDuration(report: VitestJsonReport) {
  const end = Math.max(...report.testResults.map((file) => file.endTime));
  return report.testResults.length && end >= report.startTime ? end - report.startTime : undefined;
}
