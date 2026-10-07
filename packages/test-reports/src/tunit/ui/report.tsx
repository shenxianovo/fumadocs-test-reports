'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'fumadocs-ui/components/tabs';
import { Accordion } from 'fumadocs-ui/components/ui/accordion';
import { TestDisclosure } from '../../ui/test-disclosure';
import { ReportGroups } from '../../ui/report-groups';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import type { TUnitReport as TUnitReportData, TUnitTestResult, TUnitException } from '../types';
import { StatusBadge, Duration, ErrorDetail, StdoutPanel } from '../../ui';
import { useLabels } from './labels';
import { displayCounts, statusDisplay } from './presentation';
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
      passed: group.tests.length > 0 && group.tests.every((test) => test.status === 'passed'),
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

  function select(id: string | undefined) {
    const test = visible.find((test) => test.id === id);
    setLocalSelection(test?.id);
    onTestSelect?.(test);
  }

  return (
    <section className={`ftr-report not-prose ${className ?? ''}`} aria-label={report.assemblyName}>
      <header className="ftr-run-heading">
        {showHeader && <h2>{report.assemblyName}</h2>}
        <div className="ftr-run-meta">
          <span>TUnit {report.tunitVersion}</span>
          {[report.machineName, report.operatingSystem, report.runtimeVersion]
            .filter(Boolean)
            .map((value, i) => (
              <span key={i}>{value}</span>
            ))}
          {report.timestamp && <span>{report.timestamp}</span>}
        </div>
      </header>
      <div className="ftr-metrics">
        <div>
          <span>{labels.total}</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="ftr-metric-success">
          <span>{labels.passed}</span>
          <strong>{summary.passed}</strong>
          {!!summary.flaky && (
            <small>
              {labels.flaky}: {summary.flaky}
            </small>
          )}
        </div>
        <div className="ftr-metric-danger">
          <span>{labels.unsuccessful}</span>
          <strong>{summary.unsuccessful}</strong>
        </div>
        <div>
          <span>{labels.duration}</span>
          <strong>
            <Duration value={report.totalDurationMs} unknownLabel={labels.unknown} />
          </strong>
        </div>
      </div>
      <div className="ftr-toolbar">
        <h3>{labels.results}</h3>
        <input
          type="search"
          aria-label={labels.search}
          placeholder={labels.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <ReportGroups
        filters={
          <div className="ftr-filters" aria-label={labels.results}>
            <button
              type="button"
              className={buttonVariants({
                variant: filter === null ? 'secondary' : 'ghost',
                size: 'sm',
              })}
              aria-pressed={filter === null}
              onClick={() => setFilter(null)}
            >
              {labels.all} <small>{summary.total}</small>
            </button>
            {[...summary.byStatus.keys()].map((status) => (
              <button
                type="button"
                key={status}
                className={buttonVariants({
                  variant: filter === status ? 'secondary' : 'ghost',
                  size: 'sm',
                })}
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
              >
                {statusDisplay(status, labels).status} <small>{summary.byStatus.get(status)}</small>
              </button>
            ))}
          </div>
        }
        empty={<p className="ftr-empty">{summary.total === 0 ? labels.noResults : labels.empty}</p>}
        searchKey={JSON.stringify([query, filter])}
        filtered={!!query || filter !== null}
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
          badge: group.passed ? <StatusBadge {...statusDisplay('passed', labels)} /> : undefined,
          children: (
            <Accordion
              className="ftr-group-tests"
              value={
                selected && group.tests.some((test) => test.id === selected.id) ? [selected.id] : []
              }
              onValueChange={(value) => select(typeof value[0] === 'string' ? value[0] : undefined)}
            >
              {group.tests.map((test) => (
                <TestDisclosure
                  key={test.id}
                  value={test.id}
                  badge={<StatusBadge {...statusDisplay(test.status, labels)} />}
                  name={test.displayName}
                  duration={<Duration value={test.durationMs} unknownLabel={labels.unknown} />}
                >
                  <TUnitTestDetails test={test} report={report} />
                </TestDisclosure>
              ))}
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
  const tabs = [
    ['overview', labels.overview],
    ['output', labels.output],
    ...(test.attempts?.length ? [['attempts', labels.attempts]] : []),
    ...(spans.length ? [['traces', labels.traces]] : []),
  ];
  return (
    <Tabs defaultValue="overview" className="ftr-detail-tabs">
      <TabsList aria-label={labels.overview}>
        {tabs.map(([value, label]) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="overview">
        <dl className="ftr-fields">
          <dt>ID</dt>
          <dd className="ftr-mono">{test.id}</dd>
          <dt>{labels.source}</dt>
          <dd>{test.status}</dd>
          {test.filePath && (
            <>
              <dt>{labels.location}</dt>
              <dd className="ftr-mono">
                {test.filePath}
                {test.lineNumber != null ? `:${test.lineNumber}` : ''}
              </dd>
            </>
          )}
          {test.startTime && (
            <>
              <dt>{labels.start}</dt>
              <dd>{test.startTime}</dd>
            </>
          )}
          {test.endTime && (
            <>
              <dt>{labels.end}</dt>
              <dd>{test.endTime}</dd>
            </>
          )}
          {test.retryAttempt != null && (
            <>
              <dt>{labels.retries}</dt>
              <dd>{test.retryAttempt}</dd>
            </>
          )}
          {test.skipReason && (
            <>
              <dt>{labels.skipReason}</dt>
              <dd>{test.skipReason}</dd>
            </>
          )}
          {!!test.categories?.length && (
            <>
              <dt>{labels.categories}</dt>
              <dd>{test.categories.join(', ')}</dd>
            </>
          )}
          {test.customProperties?.map((property, i) => (
            <div className="ftr-field" key={i}>
              <dt>{property.key}</dt>
              <dd>{property.value}</dd>
            </div>
          ))}
        </dl>
        {test.exception && <TUnitExceptionDetails error={test.exception} />}
      </TabsContent>
      <TabsContent value="output">
        <div className="ftr-output">
          {test.output == null && test.errorOutput == null && (
            <StdoutPanel emptyLabel={labels.noOutput} />
          )}
          {test.output != null && <StdoutPanel content={test.output} title={labels.stdout} />}
          {test.errorOutput != null && (
            <StdoutPanel content={test.errorOutput} title={labels.stderr} />
          )}
        </div>
      </TabsContent>
      {!!test.attempts?.length && (
        <TabsContent value="attempts">
          <div className="ftr-attempts">
            {test.attempts?.map((attempt, i) => (
              <div className="ftr-attempt" key={i}>
                <h4>
                  #{i + 1} <StatusBadge {...statusDisplay(attempt.status, labels)} />{' '}
                  <Duration value={attempt.durationMs} unknownLabel={labels.unknown} />
                </h4>
                <p>
                  {labels.source}: {attempt.status}
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
              </div>
            ))}
          </div>
        </TabsContent>
      )}
      {!!spans.length && (
        <TabsContent value="traces">
          <TUnitTraceTimeline spans={spans} />
        </TabsContent>
      )}
    </Tabs>
  );
}
