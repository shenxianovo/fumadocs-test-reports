'use client';

import type { ReactNode } from 'react';
import {
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'fumadocs-ui/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'fumadocs-ui/components/ui/tabs';

/** Display composition only; each presenter owns its native data and selection. */
export function TestDisclosure({
  value,
  status,
  name,
  note,
  duration,
  children,
}: {
  value: string;
  status: ReactNode;
  name: ReactNode;
  /** Short text beside the duration, such as a non-passing status label. */
  note?: ReactNode;
  duration: ReactNode;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value} className="ftr-test-item">
      <AccordionHeader className="ftr-test-header">
        <AccordionTrigger className="ftr-test">
          {status}
          <span className="ftr-test-name">{name}</span>
          {note != null && <span className="ftr-test-note">{note}</span>}
          <small>{duration}</small>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>
        <div className="ftr-detail">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

/** Underlined detail tabs; a single section renders without a tab bar. */
export function DetailTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: { value: string; label: ReactNode; content: ReactNode }[];
}) {
  if (tabs.length === 1) return <div className="ftr-detail-section">{tabs[0].content}</div>;
  return (
    <Tabs defaultValue={tabs[0].value} className="ftr-detail-tabs">
      <TabsList className="ftr-tab-list" aria-label={label}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="ftr-tab">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="ftr-detail-section">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** Label and value rows; omits entries whose value is missing. */
export function Fields({
  items,
}: {
  items: { label: ReactNode; value: ReactNode; mono?: boolean; key?: string | number }[];
}) {
  const shown = items.filter((item) => item.value != null && item.value !== false);
  if (!shown.length) return null;
  return (
    <dl className="ftr-fields">
      {shown.map((item, i) => (
        <div className="ftr-field" key={item.key ?? i}>
          <dt>{item.label}</dt>
          <dd className={item.mono ? 'ftr-mono' : undefined}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
