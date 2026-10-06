/** TUnit's .tunit-report.json sidecar fields. Additional native fields are retained. */
export interface TUnitReport {
  schemaVersion: 1;
  assemblyName: string;
  publicationGeneration?: string | null;
  machineName?: string | null;
  timestamp?: string | null;
  tunitVersion?: string | null;
  operatingSystem?: string | null;
  runtimeVersion?: string | null;
  totalDurationMs?: number | null;
  filter?: string | null;
  summary?: TUnitReportSummary | null;
  groups: TUnitTestGroup[];
  spans?: TUnitSpan[] | null;
  commitSha?: string | null;
  branch?: string | null;
  pullRequestNumber?: string | null;
  repositorySlug?: string | null;
  artifactUrl?: string | null;
  sourceLinks?: {
    lineUrl: string;
    rangeUrl: string;
    rawUrl?: string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

/** TUnit's own counters, as supplied by the producer. */
export interface TUnitReportSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  cancelled: number;
  timedOut: number;
  flaky: number;
  [key: string]: unknown;
}

export interface TUnitTestGroup {
  className: string;
  namespace?: string | null;
  summary?: TUnitReportSummary | null;
  tests: TUnitTestResult[];
  [key: string]: unknown;
}

export interface TUnitTestResult {
  id: string;
  displayName: string;
  methodName?: string | null;
  className?: string | null;
  /** Original TUnit spelling, including any unrecognised producer outcome. */
  status: string;
  durationMs?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  exception?: TUnitException | null;
  output?: string | null;
  errorOutput?: string | null;
  categories?: string[] | null;
  customProperties?: TUnitKeyValue[] | null;
  filePath?: string | null;
  lineNumber?: number | null;
  endLineNumber?: number | null;
  sourceRelativePath?: string | null;
  skipReason?: string | null;
  retryAttempt?: number | null;
  attempts?: TUnitAttempt[] | null;
  traceId?: string | null;
  spanId?: string | null;
  additionalTraceIds?: string[] | null;
  [key: string]: unknown;
}

export interface TUnitAttempt {
  status: string;
  durationMs?: number | null;
  exceptionType?: string | null;
  exceptionMessage?: string | null;
  stackTrace?: string | null;
  [key: string]: unknown;
}

export interface TUnitException {
  type?: string | null;
  message?: string | null;
  stackTrace?: string | null;
  innerException?: TUnitException | null;
  [key: string]: unknown;
}

export interface TUnitKeyValue {
  key: string;
  value: string;
  [key: string]: unknown;
}

export interface TUnitSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;
  name: string;
  spanType?: string | null;
  source?: string | null;
  kind?: string | null;
  startTimeMs: number;
  durationMs: number;
  status?: string | null;
  statusMessage?: string | null;
  tags?: TUnitKeyValue[] | null;
  events?:
    | { name: string; timestampMs: number; tags?: TUnitKeyValue[] | null; [key: string]: unknown }[]
    | null;
  links?: { traceId: string; spanId: string; [key: string]: unknown }[] | null;
  [key: string]: unknown;
}
