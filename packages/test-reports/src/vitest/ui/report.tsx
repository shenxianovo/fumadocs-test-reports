'use client';

import { useState } from 'react';
import { Accordion } from 'fumadocs-ui/components/ui/accordion';
import { TestDisclosure, DetailTabs, Fields } from '../../ui/test-disclosure';
import { ReportGroups } from '../../ui/report-groups';
import { RunSummary } from '../../ui/run-summary';
import { StatusIcon, Duration, ErrorDetail, StdoutPanel } from '../../ui';
import { useReportLabels } from '../../i18n/labels';
import type { VitestJsonReport, VitestJsonTestFile, VitestJsonAssertionResult } from '../types';
import { fileDisplay, runDuration, statusDisplay } from './presentation';

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
    return { id: String(fileIndex), file, rows, mark: fileDisplay(file, labels) };
  });
  const all = files.flatMap((file) => file.rows);
  const byStatus = new Map<string, number>();
  for (const row of all) {
    const status = row.assertion?.status ?? row.file.status;
    byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
  }
  const statuses = [...byStatus].map(([value, count]) => ({
    value,
    count,
    ...statusDisplay(value, labels),
  }));
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
      <RunSummary
        metrics={[
          { label: labels.total, value: report.numTotalTests },
          {
            label: labels.passed,
            value: report.numPassedTests,
            tone: report.numPassedTests ? 'success' : undefined,
          },
          {
            label: labels.statuses.failed,
            value: report.numFailedTests,
            tone: report.numFailedTests ? 'danger' : undefined,
          },
          {
            label: labels.files,
            value: report.testResults.length,
            note: <Duration value={runDuration(report)} unknownLabel={labels.unknown} />,
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
          { value: null, label: labels.all, count: all.length },
          ...statuses.map((entry) => ({
            value: entry.value,
            label: entry.status,
            count: entry.count,
            tone: entry.tone,
          })),
        ]}
        empty={<p className="ftr-empty">{all.length ? labels.empty : labels.noResults}</p>}
        selectedGroup={
          groups.find((group) => group.rows.some((row) => row.id === selected?.id))?.id
        }
        selectionKey={selected?.id}
        items={groups.map((group) => {
          const path = group.file.name.replace(/\\/g, '/').split('/').slice(-4);
          return {
            id: group.id,
            title: group.file.name,
            name: (
              <span className="ftr-mono">
                {path.length > 1 && (
                  <span className="ftr-path-dir">{path.slice(0, -1).join('/')}/</span>
                )}
                {path.at(-1)}
              </span>
            ),
            count: group.rows.length,
            status: <StatusIcon {...group.mark} />,
            children: (
              <Accordion
                className="ftr-group-tests"
                value={
                  selected && group.rows.some((row) => row.id === selected.id) ? [selected.id] : []
                }
                onValueChange={(value) =>
                  select(typeof value[0] === 'string' ? value[0] : undefined)
                }
              >
                {group.rows.map((row) => {
                  const status = row.assertion?.status ?? row.file.status;
                  const mark = statusDisplay(status, labels);
                  return (
                    <TestDisclosure
                      key={row.id}
                      value={row.id}
                      status={<StatusIcon {...mark} />}
                      name={row.assertion?.fullName ?? labels.suiteError}
                      note={status !== 'passed' ? mark.status : undefined}
                      duration={
                        <Duration value={row.assertion?.duration} unknownLabel={labels.unknown} />
                      }
                    >
                      <VitestTestDetails selected={row} />
                    </TestDisclosure>
                  );
                })}
              </Accordion>
            ),
          };
        })}
      />
    </section>
  );
}

function VitestTestDetails({ selected }: { selected: VitestReportSelection }) {
  const labels = useReportLabels();
  const test = selected.assertion;
  const failures = test?.failureMessages ?? [];
  const hasMeta = !!(test?.meta && Object.keys(test.meta).length);
  return (
    <DetailTabs
      label={labels.overview}
      tabs={[
        {
          value: 'overview',
          label: labels.overview,
          content: (
            <>
              {selected.file.message && (
                <ErrorDetail type={labels.suiteError} message={selected.file.message} />
              )}
              {failures.map((message, index) => (
                <ErrorDetail key={index} message={message} />
              ))}
              <Fields
                items={[
                  { label: labels.source, value: test?.status ?? selected.file.status, mono: true },
                  {
                    label: labels.file,
                    value: `${selected.file.name}${test?.location ? `:${test.location.line}:${test.location.column}` : ''}`,
                    mono: true,
                  },
                  { label: labels.fullName, value: test?.fullName },
                  {
                    label: labels.tags,
                    value: test?.tags?.length ? test.tags.join(', ') : undefined,
                  },
                ]}
              />
            </>
          ),
        },
        ...(hasMeta
          ? [
              {
                value: 'metadata',
                label: labels.metadata,
                content: (
                  <StdoutPanel
                    title={labels.metadata}
                    content={JSON.stringify(test?.meta, null, 2)}
                  />
                ),
              },
            ]
          : []),
      ]}
    />
  );
}
