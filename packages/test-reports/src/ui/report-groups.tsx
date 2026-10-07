'use client';

import { useState, type ReactNode } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'fumadocs-ui/components/ui/accordion';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { useReportLabels } from '../i18n/labels';

/** Display props only. Framework presenters supply grouping and selection meaning. */
export function ReportGroups({
  items,
  searchKey,
  filtered,
  selectedGroup,
  selectionKey,
  filters,
  empty,
}: {
  items: {
    id: string;
    title: string;
    name: ReactNode;
    caption?: ReactNode;
    badge?: ReactNode;
    count: number;
    children: ReactNode;
  }[];
  searchKey: string;
  filtered: boolean;
  selectedGroup?: string;
  selectionKey?: string;
  filters: ReactNode;
  empty: ReactNode;
}) {
  const labels = useReportLabels();
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
      <div className="ftr-result-controls">
        {filters}
        <div className="ftr-group-actions">
          <button
            type="button"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            onClick={() => change(items.map((item) => item.id))}
            disabled={!items.length}
          >
            {labels.expandAll}
          </button>
          <button
            type="button"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            onClick={() => change([])}
            disabled={!items.length}
          >
            {labels.collapseAll}
          </button>
        </div>
      </div>
      {items.length ? (
        <Accordion multiple value={expanded} onValueChange={change}>
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="ftr-test-group">
              <AccordionHeader>
                <AccordionTrigger className="ftr-group" title={item.title}>
                  <span className="ftr-group-name">
                    {item.name}
                    {item.caption && <small>{item.caption}</small>}
                  </span>
                  {item.badge}
                  <small className="ftr-group-count">{item.count}</small>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>{item.children}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        empty
      )}
    </div>
  );
}
