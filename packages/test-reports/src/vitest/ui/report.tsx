'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'fumadocs-ui/components/tabs';
import { Accordion } from 'fumadocs-ui/components/ui/accordion';
import { TestDisclosure } from '../../ui/test-disclosure';
import { ReportGroups } from '../../ui/report-groups';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { StatusBadge, Duration, ErrorDetail, StdoutPanel } from '../../ui';
import { useReportLabels } from '../../i18n/labels';
import type { VitestJsonReport, VitestJsonTestFile, VitestJsonAssertionResult } from '../types';
import { runDuration, statusDisplay } from './presentation';

/** Presentation selection within one export, never written into its native fields. */
export interface VitestReportSelection {
  id: string;
  file: VitestJsonTestFile;
  assertion?: VitestJsonAssertionResult;
}
export interface VitestReportProps {
  report: VitestJsonReport;
  title?: string;
  className?: string;
  showHeader?: boolean;
  selectedTestId?: string | null;
  onTestSelect?: (selection: VitestReportSelection | undefined) => void;
}
export function VitestReport({
  report,
  title = 'Vitest',
  className = '',
  showHeader = true,
  selectedTestId,
  onTestSelect,
}: VitestReportProps) {
  const labels = useReportLabels();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [selection, setSelection] = useState<string>();
  const files = report.testResults.map((file, fileIndex) => {
    const rows: VitestReportSelection[] = file.assertionResults.map((assertion, index) => ({
      id: `${fileIndex}:${index}`,
      file,
      assertion,
    }));
    if (file.message || (file.status === 'failed' && !rows.length))
      rows.unshift({ id: `${fileIndex}:file`, file });
    return {
      id: String(fileIndex),
      file,
      rows,
      passed:
        file.status === 'passed' &&
        !file.message &&
        file.assertionResults.length > 0 &&
        file.assertionResults.every((test) => test.status === 'passed'),
    };
  });
  const all = files.flatMap((file) => file.rows);
  const byStatus = new Map<string, number>();
  for (const row of all) {
    const status = row.assertion?.status ?? row.file.status;
    byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
  }
  const groups = files
    .map((group) => ({
      ...group,
      rows: group.rows.filter(
        (row) =>
          (filter === null || (row.assertion?.status ?? row.file.status) === filter) &&
          `${row.file.name} ${row.assertion?.fullName ?? ''}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    }))
    .filter((group) => group.rows.length);
  const visible = groups.flatMap((group) => group.rows);
  const selected = visible.find(
    (row) => row.id === (selectedTestId === undefined ? selection : selectedTestId),
  );
  function select(id: string | undefined) {
    const row = visible.find((row) => row.id === id);
    setSelection(row?.id);
    onTestSelect?.(row);
  }

  return (
    <section className={`ftr-report not-prose ${className}`} aria-label={title}>
      {showHeader && (
        <header className="ftr-run-heading">
          <h2>{title}</h2>
        </header>
      )}
      <div className="ftr-metrics">
        <div>
          <span>{labels.total}</span>
          <strong>{report.numTotalTests}</strong>
        </div>
        <div className="ftr-metric-success">
          <span>{labels.passed}</span>
          <strong>{report.numPassedTests}</strong>
        </div>
        <div className="ftr-metric-danger">
          <span>{labels.statuses.failed}</span>
          <strong>{report.numFailedTests}</strong>
        </div>
        <div>
          <span>{labels.files}</span>
          <strong>{report.testResults.length}</strong>
          <small>
            <Duration value={runDuration(report)} unknownLabel={labels.unknown} />
          </small>
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
              {labels.all} <small>{all.length}</small>
            </button>
            {[...byStatus].map(([status, count]) => (
              <button
                key={status}
                type="button"
                className={buttonVariants({
                  variant: filter === status ? 'secondary' : 'ghost',
                  size: 'sm',
                })}
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
              >
                {statusDisplay(status, labels).status} <small>{count}</small>
              </button>
            ))}
          </div>
        }
        empty={<p className="ftr-empty">{all.length ? labels.empty : labels.noResults}</p>}
        searchKey={JSON.stringify([query, filter])}
        filtered={!!query || filter !== null}
        selectedGroup={
          groups.find((group) => group.rows.some((row) => row.id === selected?.id))?.id
        }
        selectionKey={selected?.id}
        items={groups.map((group) => ({
          id: group.id,
          title: group.file.name,
          name: (
            <span className="ftr-mono">
              {group.file.name.replace(/\\/g, '/').split('/').slice(-4).join('/')}
            </span>
          ),
          count: group.rows.length,
          badge: group.passed ? <StatusBadge {...statusDisplay('passed', labels)} /> : undefined,
          children: (
            <Accordion
              className="ftr-group-tests"
              value={
                selected && group.rows.some((row) => row.id === selected.id) ? [selected.id] : []
              }
              onValueChange={(value) => select(typeof value[0] === 'string' ? value[0] : undefined)}
            >
              {group.rows.map((row) => (
                <TestDisclosure
                  key={row.id}
                  value={row.id}
                  badge={
                    <StatusBadge
                      {...statusDisplay(row.assertion?.status ?? row.file.status, labels)}
                    />
                  }
                  name={row.assertion?.fullName ?? labels.suiteError}
                  duration={
                    <Duration value={row.assertion?.duration} unknownLabel={labels.unknown} />
                  }
                >
                  <VitestTestDetails selected={row} />
                </TestDisclosure>
              ))}
            </Accordion>
          ),
        }))}
      />
    </section>
  );
}

function VitestTestDetails({ selected }: { selected: VitestReportSelection }) {
  const labels = useReportLabels();
  const test = selected.assertion;
  const failures = test?.failureMessages ?? [];
  return (
    <Tabs defaultValue="overview" className="ftr-detail-tabs">
      <TabsList aria-label={labels.overview}>
        <TabsTrigger value="overview">{labels.overview}</TabsTrigger>
        {!!(test?.meta && Object.keys(test.meta).length) && (
          <TabsTrigger value="metadata">{labels.metadata}</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="overview">
        <dl className="ftr-fields">
          <dt>{labels.file}</dt>
          <dd className="ftr-mono">{selected.file.name}</dd>
          <dt>{labels.source}</dt>
          <dd>{test?.status ?? selected.file.status}</dd>
          {test && (
            <>
              <dt>{labels.fullName}</dt>
              <dd>{test.fullName}</dd>
            </>
          )}
          {test?.location && (
            <>
              <dt>{labels.location}</dt>
              <dd className="ftr-mono">
                {test.location.line}:{test.location.column}
              </dd>
            </>
          )}
          {!!test?.tags?.length && (
            <>
              <dt>{labels.tags}</dt>
              <dd>{test.tags.join(', ')}</dd>
            </>
          )}
        </dl>
        {selected.file.message && (
          <ErrorDetail type={labels.suiteError} message={selected.file.message} />
        )}
        {failures.map((message, index) => (
          <ErrorDetail key={index} message={message} />
        ))}
      </TabsContent>
      {!!(test?.meta && Object.keys(test.meta).length) && (
        <TabsContent value="metadata">
          <StdoutPanel title={labels.metadata} content={JSON.stringify(test.meta, null, 2)} />
        </TabsContent>
      )}
    </Tabs>
  );
}
