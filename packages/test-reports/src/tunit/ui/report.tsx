'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'fumadocs-ui/components/tabs';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import type { TUnitReport as TUnitReportData, TUnitTestResult, TUnitException } from '../types';
import { StatusBadge, Duration, ErrorDetail, StdoutPanel } from '../../ui';
import { getLabels, type TUnitReportLocale } from './labels';
import { displayCounts, statusDisplay } from './presentation';
import { TUnitTraceTimeline } from './trace-timeline';

export interface TUnitReportProps {
  report: TUnitReportData;
  locale?: TUnitReportLocale;
  className?: string;
  selectedTestId?: string;
  onTestSelect?: (test: TUnitTestResult) => void;
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
  locale = 'en',
  className,
  selectedTestId,
  onTestSelect,
}: TUnitReportProps) {
  const labels = getLabels(locale);
  const summary = displayCounts(report);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [localSelection, setLocalSelection] = useState<string>();
  const groups = report.groups
    .map((group) => ({
      ...group,
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
  const selected =
    visible.find((test) => test.id === (selectedTestId ?? localSelection)) ?? visible[0];
  const traceIds = new Set([selected?.traceId, ...(selected?.additionalTraceIds ?? [])]);
  const spans = report.spans?.filter((span) => traceIds.has(span.traceId)) ?? [];
  const tabs = [
    ['overview', labels.overview],
    ['output', labels.output],
    ...(selected?.attempts?.length ? [['attempts', labels.attempts]] : []),
    ...(spans.length ? [['traces', labels.traces]] : []),
  ];

  function select(test: TUnitTestResult) {
    setLocalSelection(test.id);
    onTestSelect?.(test);
  }

  return (
    <section className={`ftr-report not-prose ${className ?? ''}`} aria-label={report.assemblyName}>
      <header className="ftr-run-heading">
        <h2>{report.assemblyName}</h2>
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
        <div>
          <span>{labels.passed}</span>
          <strong>{summary.passed}</strong>
          <small>
            {labels.flaky}: {summary.flaky}
          </small>
        </div>
        <div>
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
            {statusDisplay(status, locale).status} <small>{summary.byStatus.get(status)}</small>
          </button>
        ))}
      </div>
      <div className="ftr-workspace">
        <div className="ftr-list" aria-label={labels.results}>
          {groups.length === 0 && (
            <p className="ftr-empty">{summary.total === 0 ? labels.noResults : labels.empty}</p>
          )}
          {groups.map((group, i) => (
            <div key={i}>
              <div className="ftr-group">
                <strong>{group.className}</strong>
                {group.namespace && <small>{group.namespace}</small>}
              </div>
              {group.tests.map((test) => (
                <button
                  type="button"
                  className={`${buttonVariants({ variant: 'ghost' })} ftr-test`}
                  aria-pressed={selected?.id === test.id}
                  key={test.id}
                  onClick={() => select(test)}
                >
                  <StatusBadge {...statusDisplay(test.status, locale)} />
                  <span className="ftr-test-name">{test.displayName}</span>
                  <small>
                    <Duration value={test.durationMs} unknownLabel={labels.unknown} />
                  </small>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="ftr-detail" aria-label={labels.overview}>
          {selected ? (
            <>
              <div className="ftr-detail-heading">
                <StatusBadge {...statusDisplay(selected.status, locale)} />
                <h3>{selected.displayName}</h3>
                <small>
                  <Duration value={selected.durationMs} unknownLabel={labels.unknown} />
                </small>
              </div>
              <Tabs key={selected.id} defaultValue="overview" className="ftr-detail-tabs">
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
                    <dd>{selected.id}</dd>
                    <dt>{labels.source}</dt>
                    <dd>{selected.status}</dd>
                    {selected.filePath && (
                      <>
                        <dt>{labels.location}</dt>
                        <dd>
                          {selected.filePath}
                          {selected.lineNumber != null ? `:${selected.lineNumber}` : ''}
                        </dd>
                      </>
                    )}
                    {selected.startTime && (
                      <>
                        <dt>{labels.start}</dt>
                        <dd>{selected.startTime}</dd>
                      </>
                    )}
                    {selected.endTime && (
                      <>
                        <dt>{labels.end}</dt>
                        <dd>{selected.endTime}</dd>
                      </>
                    )}
                    {selected.retryAttempt != null && (
                      <>
                        <dt>{labels.retries}</dt>
                        <dd>{selected.retryAttempt}</dd>
                      </>
                    )}
                    {selected.skipReason && (
                      <>
                        <dt>{labels.skipReason}</dt>
                        <dd>{selected.skipReason}</dd>
                      </>
                    )}
                    {!!selected.categories?.length && (
                      <>
                        <dt>{labels.categories}</dt>
                        <dd>{selected.categories.join(', ')}</dd>
                      </>
                    )}
                    {selected.customProperties?.map((property, i) => (
                      <div className="ftr-field" key={i}>
                        <dt>{property.key}</dt>
                        <dd>{property.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {selected.exception && <TUnitExceptionDetails error={selected.exception} />}
                </TabsContent>
                <TabsContent value="output">
                  <div className="ftr-output">
                    {selected.output == null && selected.errorOutput == null && (
                      <StdoutPanel emptyLabel={labels.noOutput} />
                    )}
                    {selected.output != null && (
                      <StdoutPanel content={selected.output} title={labels.stdout} />
                    )}
                    {selected.errorOutput != null && (
                      <StdoutPanel content={selected.errorOutput} title={labels.stderr} />
                    )}
                  </div>
                </TabsContent>
                {!!selected.attempts?.length && (
                  <TabsContent value="attempts">
                    <div className="ftr-attempts">
                      {selected.attempts?.map((attempt, i) => (
                        <div className="ftr-attempt" key={i}>
                          <h4>
                            #{i + 1} <StatusBadge {...statusDisplay(attempt.status, locale)} />{' '}
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
                    <TUnitTraceTimeline spans={spans} locale={locale} />
                  </TabsContent>
                )}
              </Tabs>
            </>
          ) : (
            <p className="ftr-empty">{labels.empty}</p>
          )}
        </div>
      </div>
    </section>
  );
}
