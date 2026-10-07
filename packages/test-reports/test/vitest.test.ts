import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseVitestReport, VitestParseError } from '../src/vitest';
import fumadocs from './fixtures/vitest/fumadocs.json';
import provenance from './fixtures/vitest/provenance.json';
import sample from './fixtures/vitest/edge-cases.json';

describe('Vitest native JSON parser', () => {
  it('reads the complete producer report without changing or stripping fields', () => {
    const before = JSON.stringify(fumadocs);
    const report = parseVitestReport(fumadocs);
    expect(report).toBe(fumadocs);
    expect(report.numTotalTests).toBe(656);
    expect(report.testResults).toHaveLength(87);
    expect(report.numTotalTestSuites).toBe(166);
    expect(JSON.stringify(report)).toBe(before);
    const raw = readFileSync(new URL('./fixtures/vitest/fumadocs.json', import.meta.url));
    expect(createHash('sha256').update(raw).digest('hex')).toBe(provenance.report.sha256);
    const html = readFileSync(
      new URL('../../../apps/docs/public/reports/vitest-report.html', import.meta.url),
    );
    expect(createHash('sha256').update(html).digest('hex')).toBe(provenance.htmlReport.sha256);
    expect(provenance.htmlReport.sameRunAsJson).toBe(true);
  });

  it('preserves extensions at every level, nullable payloads and arbitrary outcome strings', () => {
    const input = structuredClone(sample);
    const report = parseVitestReport({
      ...input,
      extension: { source: true },
      coverageMap: { extra: true },
    });
    expect(report.extension).toEqual({ source: true });
    expect(report.coverageMap).toEqual({ extra: true });
    expect(report.testResults[1].assertionResults[2].extension).toEqual({
      artifact: 'retained.mp4',
    });
    expect(report.testResults[0].assertionResults[2].duration).toBeNull();
    expect(report.testResults[1].assertionResults[2].status).toBe('vendorOutcome');
    const assertion = report.testResults[0].assertionResults[0];
    assertion.failureMessages = null;
    assertion.location = null;
    delete assertion.duration;
    expect(parseVitestReport(report)).toBe(report);
  });

  it('allows duplicate names, partial result lists and file failures without assertions', () => {
    const report = parseVitestReport(structuredClone(sample));
    expect(report.testResults[0].assertionResults[0].fullName).toBe(
      report.testResults[1].assertionResults[0].fullName,
    );
    expect(report.testResults[2].assertionResults).toEqual([]);
    report.numTotalTests = 100;
    expect(parseVitestReport(report).numTotalTests).toBe(100);
  });

  it.each([null, [], 'bad'])('rejects a malformed root: %s', (input) => {
    expect(() => parseVitestReport(input)).toThrow(VitestParseError);
  });
  it.each([-1, Infinity, NaN, '12', {}])('rejects invalid supplied duration: %s', (duration) => {
    const input = structuredClone(sample) as unknown as Record<string, any>;
    input.testResults[0].assertionResults[0].duration = duration;
    expect(() => parseVitestReport(input)).toThrow('$.testResults[0].assertionResults[0].duration');
  });
  it('rejects incompatible structure with a precise field path instead of dropping a test', () => {
    const input = structuredClone(sample) as unknown as Record<string, any>;
    input.testResults[0].assertionResults[0].failureMessages = [null];
    expect(() => parseVitestReport(input)).toThrow(
      '$.testResults[0].assertionResults[0].failureMessages[0]',
    );
    input.testResults = null;
    expect(() => parseVitestReport(input)).toThrow('$.testResults');
  });
  it('rejects invalid counters and reporter success values', () => {
    expect(() => parseVitestReport({ ...sample, numFailedTests: 0.5 })).toThrow('$.numFailedTests');
    expect(() => parseVitestReport({ ...sample, success: 'true' })).toThrow('$.success');
  });
});
