'use client';

import { useState, type ReactNode } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'fumadocs-ui/components/ui/accordion';
import { useReportLabels } from '../i18n/labels';
import type { BadgeTone } from './primitives';

export interface StatusFilterOption {
  /** Native status value; null means every status. */
  value: string | null;
  label: string;
  count: number;
  tone?: BadgeTone;
}

/** Display props only. Framework presenters supply grouping and selection meaning. */
export function ReportGroups({
  items,
  query,
  onQueryChange,
  filters,
  filter,
  onFilterChange,
  selectedGroup,
  selectionKey,
  empty,
}: {
  items: {
    id: string;
    title: string;
    name: ReactNode;
    caption?: ReactNode;
    status?: ReactNode;
    count: number;
    children: ReactNode;
  }[];
  query: string;
  onQueryChange: (query: string) => void;
  filters: StatusFilterOption[];
  filter: string | null;
  onFilterChange: (filter: string | null) => void;
  selectedGroup?: string;
  selectionKey?: string;
  empty: ReactNode;
}) {
  const labels = useReportLabels();
  const searchKey = JSON.stringify([query, filter]);
  const filtered = !!query || filter !== null;
  const initial = () =>
    filtered ? items.map((item) => item.id) : selectedGroup ? [selectedGroup] : [];
  const [state, setState] = useState(() => ({ searchKey, selectionKey, expanded: initial() }));
  let expanded = state.expanded;
  // Adjust before rendering: direct test links also reveal their group during server rendering.
  if (state.searchKey !== searchKey || state.selectionKey !== selectionKey) {
    expanded =
      state.searchKey !== searchKey
        ? initial()
        : selectedGroup
          ? [...new Set([...expanded, selectedGroup])]
          : expanded;
    setState({ searchKey, selectionKey, expanded });
  }
  function change(value: unknown[]) {
    setState({
      searchKey,
      selectionKey,
      expanded: value.filter((id): id is string => typeof id === 'string'),
    });
  }
  return (
    <div className="ftr-list">
      <div className="ftr-toolbar" role="toolbar" aria-label={labels.results}>
        <div className="ftr-filters" role="group" aria-label={labels.status}>
          {filters.map((option) => (
            <button
              type="button"
              key={option.value ?? ''}
              className="ftr-filter"
              aria-pressed={filter === option.value}
              onClick={() => onFilterChange(option.value)}
            >
              {option.tone && <span className="ftr-dot" data-tone={option.tone} />}
              {option.label}
              <small>{option.count}</small>
            </button>
          ))}
        </div>
        <div className="ftr-toolbar-end">
          <label className="ftr-search">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.25" />
              <path d="m10.25 10.25 3 3" />
            </svg>
            <input
              type="search"
              aria-label={labels.search}
              placeholder={labels.search}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onQueryChange('');
              }}
            />
          </label>
          <button
            type="button"
            className="ftr-icon-button"
            aria-label={labels.expandAll}
            title={labels.expandAll}
            onClick={() => change(items.map((item) => item.id))}
            disabled={!items.length}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m5 6 3-3 3 3M5 10l3 3 3-3" />
            </svg>
          </button>
          <button
            type="button"
            className="ftr-icon-button"
            aria-label={labels.collapseAll}
            title={labels.collapseAll}
            onClick={() => change([])}
            disabled={!items.length}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m5 3 3 3 3-3M5 13l3-3 3 3" />
            </svg>
          </button>
        </div>
      </div>
      {items.length ? (
        <Accordion className="ftr-groups" multiple value={expanded} onValueChange={change}>
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="ftr-test-group">
              <AccordionHeader className="ftr-group-header">
                <AccordionTrigger className="ftr-group" title={item.title}>
                  {item.status}
                  <span className="ftr-group-name">
                    {item.name}
                    {item.caption && <small>{item.caption}</small>}
                  </span>
                  <small className="ftr-group-count">{item.count}</small>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>{item.children}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="ftr-groups ftr-groups-empty">{empty}</div>
      )}
    </div>
  );
}
