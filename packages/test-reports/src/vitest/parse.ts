import type { VitestJsonReport } from './types';

export class VitestParseError extends Error {
  constructor(
    public readonly path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = 'VitestParseError';
  }
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new VitestParseError(path, 'expected an object');
  return value as Record<string, unknown>;
}
function text(value: unknown, path: string, nonempty = false) {
  if (typeof value !== 'string' || (nonempty && !value.trim()))
    throw new VitestParseError(
      path,
      nonempty ? 'expected a non-empty string' : 'expected a string',
    );
}
function number(value: unknown, path: string, integer = false) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    (integer && !Number.isSafeInteger(value))
  )
    throw new VitestParseError(
      path,
      integer ? 'expected a non-negative safe integer' : 'expected a finite non-negative number',
    );
}
function list(value: unknown, path: string, check: (item: unknown, path: string) => void) {
  if (!Array.isArray(value)) throw new VitestParseError(path, 'expected an array');
  value.forEach((item, index) => check(item, `${path}[${index}]`));
}
function assertion(value: unknown, path: string) {
  const a = object(value, path);
  for (const key of ['title', 'fullName']) text(a[key], `${path}.${key}`);
  text(a.status, `${path}.status`, true);
  list(a.ancestorTitles, `${path}.ancestorTitles`, text);
  if (a.failureMessages !== null) list(a.failureMessages, `${path}.failureMessages`, text);
  if (a.duration != null) number(a.duration, `${path}.duration`);
  if (a.location != null) {
    const loc = object(a.location, `${path}.location`);
    for (const key of ['line', 'column']) number(loc[key], `${path}.location.${key}`, true);
  }
  if (a.meta !== undefined) object(a.meta, `${path}.meta`);
  if (a.tags !== undefined) list(a.tags, `${path}.tags`, text);
}

/** Validate decoded official JSON reporter output without rebuilding or mutating it. */
export function parseVitestReport(input: unknown): VitestJsonReport {
  const r = object(input, '$');
  for (const key of [
    'numFailedTests',
    'numFailedTestSuites',
    'numPassedTests',
    'numPassedTestSuites',
    'numPendingTests',
    'numPendingTestSuites',
    'numTodoTests',
    'numTotalTests',
    'numTotalTestSuites',
  ])
    number(r[key], `$.${key}`, true);
  number(r.startTime, '$.startTime');
  if (typeof r.success !== 'boolean') throw new VitestParseError('$.success', 'expected a boolean');
  list(r.testResults, '$.testResults', (value, path) => {
    const f = object(value, path);
    text(f.name, `${path}.name`, true);
    text(f.status, `${path}.status`, true);
    text(f.message, `${path}.message`);
    number(f.startTime, `${path}.startTime`);
    number(f.endTime, `${path}.endTime`);
    list(f.assertionResults, `${path}.assertionResults`, assertion);
  });
  return input as VitestJsonReport;
}
