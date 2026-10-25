'use client';

import { useState } from 'react';
import { Accordion } from 'fumadocs-ui/components/ui/accordion';
import { TestDisclosure, DetailTabs, Fields } from '../../ui/test-disclosure';
import { ReportGroups } from '../../ui/report-groups';
import { RunSummary } from '../../ui/run-summary';
import type { TUnitReport as TUnitReportData, TUnitTestResult, TUnitException } from '../types';
import { StatusIcon, Duration, ErrorDetail, StdoutPanel } from '../../ui';
import { useLabels } from './labels';
import { displayCounts, groupDisplay, statusDisplay } from './presentation';
import { TUnitTraceTimeline } from './trace-timeline';

export interface TUnitReportProps {
  report: TUnitReportData;
  className?: string;
  showHeader?: boolean;
  selectedTestId?: string | null;
  onTestSelect?: (test: TUnitTestResult | undefined) => void;
}

function TUnitExceptionDetails({ error }: { error: TUnitException }) {
  return (
    <ErrorDetail type={error.type} message={error.message} stack={error.stackTrace}>
      {error.innerException && <TUnitExceptionDetails error={error.innerException} />}
    </ErrorDetail>
  );
}

/** TUnit presenter: reads native fields and composes shared UI primitives. */
export function TUnitReport({
  report,
  className,
  showHeader = true,
  selectedTestId,
  onTestSelect,
}: TUnitReportProps) {
  const labels = useLabels();
  const summary = displayCounts(report);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [localSelection, setLocalSelection] = useState<string>();
  const groups = report.groups
    .map((group, index) => ({
      ...group,
      groupId: String(index),
      mark: groupDisplay(
        group.tests.map((test) => test.status),
        labels,
      ),
      tests: group.tests.filter(
        (test) =>
          (filter === null || test.status === filter) &&
          `${test.displayName} ${group.className} ${group.namespace ?? ''}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    }))
    .filter((group) => group.tests.length > 0);
  const visible = groups.flatMap((group) => group.tests);
  const selected = visible.find(
    (test) => test.id === (selectedTestId === undefined ? localSelection : selectedTestId),
  );
  const statuses = [...summary.byStatus].map(([value, count]) => ({
    value,
    count,
    ...statusDisplay(value, labels),
  }));

  function select(id: string | undefined) {
    const test = visible.find((test) => test.id === id);
    setLocalSelection(test?.id);
    onTestSelect?.(test);
  }

  return (
    <section className={`ftr-report not-prose ${className ?? ''}`} aria-label={report.assemblyName}>
      <header className="ftr-run-heading">
        {showHeader && <h2>{report.assemblyName}</h2>}
        <ul className="ftr-run-meta">
          <li>TUnit {report.tunitVersion}</li>
          {[report.machineName, report.operatingSystem, report.runtimeVersion, report.timestamp]
            .filter(Boolean)
            .map((value, i) => (
              <li key={i}>{value}</li>
            ))}
        </ul>
      </header>
      <RunSummary
        metrics={[
          { label: labels.total, value: summary.total },
          {
            label: labels.passed,
            value: summary.passed,
            tone: summary.passed ? 'success' : undefined,
            note: summary.flaky ? `${labels.flaky} ${summary.flaky}` : undefined,
          },
          {
            label: labels.unsuccessful,
            value: summary.unsuccessful,
            tone: summary.unsuccessful ? 'danger' : undefined,
          },
          {
            label: labels.duration,
            value: <Duration value={report.totalDurationMs} unknownLabel={labels.unknown} />,
          },
        ]}
        segments={statuses.map((entry) => ({
          key: entry.value,
          label: entry.status,
          count: entry.count,
          tone: entry.tone,
        }))}
      />
      <ReportGroups
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        filters={[
          { value: null, label: labels.all, count: summary.total },
          ...statuses.map((entry) => ({
            value: entry.value,
            label: entry.status,
            count: entry.count,
            tone: entry.tone,
          })),
        ]}
        empty={<p className="ftr-empty">{summary.total === 0 ? labels.noResults : labels.empty}</p>}
        selectedGroup={
          groups.find((group) => group.tests.some((test) => test.id === selected?.id))?.groupId
        }
        selectionKey={selected?.id}
        items={groups.map((group) => ({
          id: group.groupId,
          title: [group.namespace, group.className].filter(Boolean).join('.'),
          name: <span className="ftr-mono">{group.className}</span>,
          caption: group.namespace && <span className="ftr-mono">{group.namespace}</span>,
          count: group.tests.length,
          status: <StatusIcon {...group.mark} />,
          children: (
            <Accordion
              className="ftr-group-tests"
              value={
                selected && group.tests.some((test) => test.id === selected.id) ? [selected.id] : []
              }
              onValueChange={(value) => select(typeof value[0] === 'string' ? value[0] : undefined)}
            >
              {group.tests.map((test) => {
                const mark = statusDisplay(test.status, labels);
                return (
                  <TestDisclosure
                    key={test.id}
                    value={test.id}
                    status={<StatusIcon {...mark} />}
                    name={test.displayName}
                    note={
                      test.status !== 'passed'
                        ? mark.status
                        : test.retryAttempt
                          ? labels.flaky
                          : undefined
                    }
                    duration={<Duration value={test.durationMs} unknownLabel={labels.unknown} />}
                  >
                    <TUnitTestDetails test={test} report={report} />
                  </TestDisclosure>
                );
              })}
            </Accordion>
          ),
        }))}
      />
    </section>
  );
}

function TUnitTestDetails({ test, report }: { test: TUnitTestResult; report: TUnitReportData }) {
  const labels = useLabels();
  const traceIds = new Set([test.traceId, ...(test.additionalTraceIds ?? [])]);
  const spans = report.spans?.filter((span) => traceIds.has(span.traceId)) ?? [];
  const hasOutput = test.output != null || test.errorOutput != null;
  return (
    <DetailTabs
      label={labels.overview}
      tabs={[
        {
          value: 'overview',
          label: labels.overview,
          content: (
            <>
              {test.exception && <TUnitExceptionDetails error={test.exception} />}
              <Fields
                items={[
                  { label: labels.source, value: test.status, mono: true },
                  {
                    label: labels.location,
                    value:
                      test.filePath &&
                      `${test.filePath}${test.lineNumber != null ? `:${test.lineNumber}` : ''}`,
                    mono: true,
                  },
                  { label: labels.start, value: test.startTime || undefined },
                  { label: labels.end, value: test.endTime || undefined },
                  { label: labels.retries, value: test.retryAttempt },
                  { label: labels.skipReason, value: test.skipReason || undefined },
                  {
                    label: labels.categories,
                    value: test.categories?.length ? test.categories.join(', ') : undefined,
                  },
                  ...(test.customProperties ?? []).map((property) => ({
                    label: property.key,
                    value: property.value,
                  })),
                  { label: 'ID', value: test.id, mono: true },
                ]}
              />
            </>
          ),
        },
        {
          value: 'output',
          label: labels.output,
          content: (
            <div className="ftr-output">
              {!hasOutput && <StdoutPanel emptyLabel={labels.noOutput} />}
              {test.output != null && <StdoutPanel content={test.output} title={labels.stdout} />}
              {test.errorOutput != null && (
                <StdoutPanel content={test.errorOutput} title={labels.stderr} />
              )}
            </div>
          ),
        },
        ...(test.attempts?.length
          ? [
              {
                value: 'attempts',
                label: labels.attempts,
                content: (
                  <ol className="ftr-attempts">
                    {test.attempts.map((attempt, i) => {
                      const mark = statusDisplay(attempt.status, labels);
                      return (
                        <li className="ftr-attempt" key={i}>
                          <p className="ftr-attempt-heading">
                            <span className="ftr-attempt-index">#{i + 1}</span>
                            <StatusIcon {...mark} />
                            <span>{mark.status}</span>
                            <Duration value={attempt.durationMs} unknownLabel={labels.unknown} />
                          </p>
                          {(attempt.exceptionType != null ||
                            attempt.exceptionMessage != null ||
                            attempt.stackTrace != null) && (
                            <ErrorDetail
                              type={attempt.exceptionType}
                              message={attempt.exceptionMessage}
                              stack={attempt.stackTrace}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                ),
              },
            ]
          : []),
        ...(spans.length
          ? [
              {
                value: 'traces',
                label: labels.traces,
                content: <TUnitTraceTimeline spans={spans} />,
              },
            ]
          : []),
      ]}
    />
  );
}
