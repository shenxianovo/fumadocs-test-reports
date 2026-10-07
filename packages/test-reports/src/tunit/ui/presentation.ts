import type { BadgeTone } from '../../ui';
import type { TUnitReport } from '../types';
import type { ReportLabels } from './labels';

/** TUnit-specific display decisions, never a persisted or shared test model. */
export function statusDisplay(status: string, labels: ReportLabels) {
  const tone: BadgeTone =
    status === 'passed'
      ? 'success'
      : ['failed', 'error', 'timedOut', 'cancelled'].includes(status)
        ? 'danger'
        : status === 'inProgress'
          ? 'info'
          : 'neutral';
  return {
    status: Object.hasOwn(labels.statuses, status) ? labels.statuses[status] : status,
    tone,
  };
}

export function displayCounts(report: TUnitReport) {
  const tests = report.groups.flatMap((group) => group.tests);
  const byStatus = new Map<string, number>();
  for (const test of tests) byStatus.set(test.status, (byStatus.get(test.status) ?? 0) + 1);
  const passed = report.summary?.passed ?? byStatus.get('passed') ?? 0;
  const unsuccessful = report.summary
    ? report.summary.failed + report.summary.timedOut + report.summary.cancelled
    : ['failed', 'error', 'timedOut', 'cancelled'].reduce(
        (sum, status) => sum + (byStatus.get(status) ?? 0),
        0,
      );
  const flaky =
    report.summary?.flaky ??
    tests.filter(
      (test) =>
        test.status === 'passed' &&
        ((test.retryAttempt ?? 0) > 0 ||
          test.attempts?.some((attempt) =>
            ['failed', 'error', 'timedOut'].includes(attempt.status),
          )),
    ).length;
  return { byStatus, total: report.summary?.total ?? tests.length, passed, unsuccessful, flaky };
}

export function runDisplay(report: TUnitReport, labels: ReportLabels) {
  const counts = displayCounts(report);
  for (const status of ['failed', 'error', 'timedOut', 'cancelled', 'inProgress'])
    if (counts.byStatus.has(status)) return statusDisplay(status, labels);
  if (counts.unsuccessful > 0) return statusDisplay('failed', labels);
  if (
    counts.total === 0 ||
    [...counts.byStatus.keys()].some((status) => !['passed', 'skipped'].includes(status))
  )
    return statusDisplay('unknown', labels);
  return statusDisplay(counts.passed > 0 ? 'passed' : 'skipped', labels);
}
