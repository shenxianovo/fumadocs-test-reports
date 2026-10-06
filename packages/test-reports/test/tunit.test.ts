import { describe, expect, it } from 'vitest';
import { parseTUnitReport, TUnitParseError } from '../src/tunit';
import heartbeat from './fixtures/heartbeat.tunit-report.json';

function report(tests: unknown[] = []) {
  return { schemaVersion: 1, assemblyName: 'Example', groups: [{ className: 'Tests', tests }] };
}

function test(overrides: Record<string, unknown> = {}) {
  return { id: 'test', displayName: 'Example test', status: 'passed', ...overrides };
}

describe('TUnit native parser', () => {
  it('returns the full native report without changing fields or values', () => {
    const before = JSON.stringify(heartbeat);
    const run = parseTUnitReport(heartbeat);
    const result = run.groups[0].tests[0];
    expect(run).toEqual(heartbeat);
    expect(run.summary).toMatchObject({ total: 1, passed: 1, failed: 0 });
    expect(result.displayName).toBe('SavedObserverCanBeReadFromANewContext');
    expect(result.lineNumber).toBe(29);
    expect(result.output).toContain('Connected to Docker');
    expect(run.spans?.filter((s) => result.traceId === s.traceId)).toHaveLength(28);
    expect(run.spans?.[0]).toMatchObject({
      spanId: heartbeat.spans[0].spanId,
      parentSpanId: heartbeat.spans[0].parentSpanId,
      tags: heartbeat.spans[0].tags,
    });
    expect(run).toBe(heartbeat);
    expect(JSON.stringify(heartbeat)).toBe(before);
  });

  it('retains unrecognised native fields without an opt-in or a raw wrapper', () => {
    const input = { ...report(), extra: { custom: true } };
    expect(parseTUnitReport(input)).toEqual(input);
    expect(parseTUnitReport(input).extra).toEqual({ custom: true });
  });

  it('preserves nested extension fields and explicit nulls', () => {
    const input = report([
      test({ output: null, durationMs: null, extension: { artifact: 'video.mp4' } }),
    ]);
    const native = parseTUnitReport(input);
    expect(native).toEqual(input);
    expect(native.groups[0].tests[0].output).toBeNull();
    expect(native.groups[0].tests[0].durationMs).toBeNull();
    expect(native.groups[0].tests[0].extension).toEqual({ artifact: 'video.mp4' });
  });

  it('retains producer summary counters even when the visible list is partial', () => {
    const input = {
      ...report([test()]),
      summary: { total: 4, passed: 3, failed: 1, skipped: 0, cancelled: 0, timedOut: 0, flaky: 0 },
    };
    expect(parseTUnitReport(input).summary).toEqual(input.summary);
  });

  it('preserves unknown status and missing duration', () => {
    const run = parseTUnitReport(report([test({ status: 'vendorOutcome' })]));
    expect(run.groups[0].tests[0]).toMatchObject({
      status: 'vendorOutcome',
    });
    expect(run.groups[0].tests[0].durationMs).toBeUndefined();
    expect(run.groups[0].tests[0]).not.toHaveProperty('sourceStatus');
  });

  it('keeps running, errors, timeouts and cancellations distinct', () => {
    const statuses = ['inProgress', 'error', 'timedOut', 'cancelled', 'skipped'];
    const run = parseTUnitReport(report(statuses.map((status) => test({ id: status, status }))));
    expect(run.groups[0].tests.map((test) => test.status)).toEqual(statuses);
  });

  it('retains the native retryAttempt and flat attempt exception fields', () => {
    const run = parseTUnitReport(
      report([
        test({
          retryAttempt: 1,
          attempts: [
            {
              status: 'failed',
              durationMs: 10,
              exceptionType: 'Timeout',
              exceptionMessage: 'Retry me',
              stackTrace: 'at test',
            },
            { status: 'passed', durationMs: 0 },
          ],
        }),
      ]),
    );
    expect(run.groups[0].tests).toHaveLength(1);
    expect(run.groups[0].tests[0].retryAttempt).toBe(1);
    expect(run.groups[0].tests[0].attempts?.[0]).toEqual({
      status: 'failed',
      durationMs: 10,
      exceptionType: 'Timeout',
      exceptionMessage: 'Retry me',
      stackTrace: 'at test',
    });
    expect(run.groups[0].tests[0].attempts?.[1].durationMs).toBe(0);
  });

  it('retains nested errors, skip reasons and stderr', () => {
    const run = parseTUnitReport(
      report([
        test({
          status: 'failed',
          errorOutput: '<script>alert(1)</script>',
          skipReason: 'why',
          exception: { type: 'Outer', message: 'outer', innerException: { message: 'inner' } },
        }),
      ]),
    );
    expect(run.groups[0].tests[0]).toMatchObject({
      errorOutput: '<script>alert(1)</script>',
      skipReason: 'why',
      exception: { innerException: { message: 'inner' } },
    });
  });

  it('accepts an empty run without inventing a passing result', () => {
    expect(parseTUnitReport(report()).groups[0].tests).toEqual([]);
  });

  it.each([undefined, 0, 2, '1'])('rejects unsupported schema version %s', (schemaVersion) => {
    expect(() => parseTUnitReport({ ...report(), schemaVersion })).toThrow('$.schemaVersion');
  });

  it.each([null, [], 'not a report'])('rejects malformed root %s', (input) => {
    expect(() => parseTUnitReport(input)).toThrow(TUnitParseError);
  });

  it.each([Infinity, NaN, -1, '12'])(
    'rejects invalid duration %s with its field path',
    (durationMs) => {
      expect(() => parseTUnitReport(report([test({ durationMs })]))).toThrow(
        '$.groups[0].tests[0].durationMs',
      );
    },
  );

  it('rejects duplicate ids across groups', () => {
    const input = report([test()]);
    input.groups.push({ className: 'OtherTests', tests: [test()] });
    expect(() => parseTUnitReport(input)).toThrow('$.groups[1].tests[0].id: duplicate');
  });

  it('rejects malformed optional payloads instead of silently losing them', () => {
    expect(() => parseTUnitReport(report([test({ attempts: 'bad' })]))).toThrow('.attempts');
    expect(() => parseTUnitReport(report([test({ exception: [] })]))).toThrow('.exception');
    expect(() =>
      parseTUnitReport({ ...report(), spans: [{ traceId: 't', spanId: 's', name: 'span' }] }),
    ).toThrow('$.spans[0]');
  });

  it('rejects null category entries rather than producing an invalid string array', () => {
    expect(() => parseTUnitReport(report([test({ categories: [null] })]))).toThrow(
      '.categories[0]',
    );
  });
});
