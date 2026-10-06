import type { TUnitReport } from './types';

export class TUnitParseError extends Error {
  constructor(
    public readonly path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = 'TUnitParseError';
  }
}

type ObjectValue = Record<string, unknown>;
function object(value: unknown, path: string): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TUnitParseError(path, 'expected an object');
  return value as ObjectValue;
}
function text(value: unknown, path: string, required = false) {
  if (value == null && !required) return;
  if (typeof value !== 'string') throw new TUnitParseError(path, 'expected a string');
}
function nonempty(value: unknown, path: string) {
  text(value, path, true);
  if (!(value as string).trim()) throw new TUnitParseError(path, 'expected a non-empty string');
}
function number(value: unknown, path: string, required = false, integer = false) {
  if (value == null && !required) return;
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    (integer && !Number.isSafeInteger(value))
  )
    throw new TUnitParseError(
      path,
      integer ? 'expected a non-negative safe integer' : 'expected a finite non-negative number',
    );
}
function timestamp(value: unknown, path: string) {
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new TUnitParseError(path, 'expected finite epoch milliseconds');
}
function strings(value: ObjectValue, fields: string[], path: string) {
  for (const field of fields) text(value[field], `${path}.${field}`);
}
function list(
  value: unknown,
  path: string,
  validate: (value: unknown, path: string) => void,
  required = false,
) {
  if (value == null && !required) return;
  if (!Array.isArray(value)) throw new TUnitParseError(path, 'expected an array');
  value.forEach((item, index) => validate(item, `${path}[${index}]`));
}
function summary(value: unknown, path: string) {
  if (value == null) return;
  const s = object(value, path);
  for (const field of ['total', 'passed', 'failed', 'skipped', 'cancelled', 'timedOut', 'flaky'])
    number(s[field], `${path}.${field}`, true, true);
}
function exception(value: unknown, path: string, depth = 0) {
  if (value == null) return;
  if (depth > 32) throw new TUnitParseError(path, 'exception nesting exceeds 32 levels');
  const e = object(value, path);
  strings(e, ['type', 'message', 'stackTrace'], path);
  exception(e.innerException, `${path}.innerException`, depth + 1);
}
function keyValue(value: unknown, path: string) {
  const kv = object(value, path);
  text(kv.key, `${path}.key`, true);
  text(kv.value, `${path}.value`, true);
}
function attempt(value: unknown, path: string) {
  const a = object(value, path);
  nonempty(a.status, `${path}.status`);
  number(a.durationMs, `${path}.durationMs`);
  strings(a, ['exceptionType', 'exceptionMessage', 'stackTrace'], path);
}
function test(value: unknown, path: string) {
  const t = object(value, path);
  for (const field of ['id', 'displayName', 'status']) nonempty(t[field], `${path}.${field}`);
  strings(
    t,
    [
      'methodName',
      'className',
      'startTime',
      'endTime',
      'output',
      'errorOutput',
      'filePath',
      'sourceRelativePath',
      'skipReason',
      'traceId',
      'spanId',
    ],
    path,
  );
  number(t.durationMs, `${path}.durationMs`);
  for (const field of ['lineNumber', 'endLineNumber', 'retryAttempt'])
    number(t[field], `${path}.${field}`, false, true);
  exception(t.exception, `${path}.exception`);
  list(t.categories, `${path}.categories`, (item, p) => text(item, p, true));
  list(t.customProperties, `${path}.customProperties`, keyValue);
  list(t.attempts, `${path}.attempts`, attempt);
  list(t.additionalTraceIds, `${path}.additionalTraceIds`, nonempty);
}
function span(value: unknown, path: string) {
  const s = object(value, path);
  for (const field of ['traceId', 'spanId', 'name']) nonempty(s[field], `${path}.${field}`);
  strings(s, ['parentSpanId', 'spanType', 'source', 'kind', 'status', 'statusMessage'], path);
  timestamp(s.startTimeMs, `${path}.startTimeMs`);
  number(s.durationMs, `${path}.durationMs`, true);
  list(s.tags, `${path}.tags`, keyValue);
  list(s.events, `${path}.events`, (value, p) => {
    const e = object(value, p);
    nonempty(e.name, `${p}.name`);
    timestamp(e.timestampMs, `${p}.timestampMs`);
    list(e.tags, `${p}.tags`, keyValue);
  });
  list(s.links, `${path}.links`, (value, p) => {
    const link = object(value, p);
    nonempty(link.traceId, `${p}.traceId`);
    nonempty(link.spanId, `${p}.spanId`);
  });
}

/** Validate decoded sidecar JSON and return its native structure unchanged. */
export function parseTUnitReport(input: unknown): TUnitReport {
  const r = object(input, '$');
  if (r.schemaVersion !== 1)
    throw new TUnitParseError('$.schemaVersion', 'expected supported TUnit schema version 1');
  nonempty(r.assemblyName, '$.assemblyName');
  strings(
    r,
    [
      'publicationGeneration',
      'machineName',
      'timestamp',
      'tunitVersion',
      'operatingSystem',
      'runtimeVersion',
      'filter',
      'commitSha',
      'branch',
      'pullRequestNumber',
      'repositorySlug',
      'artifactUrl',
    ],
    '$',
  );
  number(r.totalDurationMs, '$.totalDurationMs');
  summary(r.summary, '$.summary');
  const ids = new Set<string>();
  list(
    r.groups,
    '$.groups',
    (value, path) => {
      const g = object(value, path);
      nonempty(g.className, `${path}.className`);
      text(g.namespace, `${path}.namespace`);
      summary(g.summary, `${path}.summary`);
      list(
        g.tests,
        `${path}.tests`,
        (value, p) => {
          test(value, p);
          const id = (value as ObjectValue).id as string;
          if (ids.has(id)) throw new TUnitParseError(`${p}.id`, `duplicate result id ${id}`);
          ids.add(id);
        },
        true,
      );
    },
    true,
  );
  list(r.spans, '$.spans', span);
  if (r.sourceLinks != null) {
    const links = object(r.sourceLinks, '$.sourceLinks');
    for (const field of ['lineUrl', 'rangeUrl']) text(links[field], `$.sourceLinks.${field}`, true);
    text(links.rawUrl, '$.sourceLinks.rawUrl');
  }
  return input as TUnitReport;
}
