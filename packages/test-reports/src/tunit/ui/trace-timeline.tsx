'use client';

import type { TUnitSpan } from '../types';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'fumadocs-ui/components/ui/accordion';
import { Duration, StdoutPanel } from '../../ui';
import { Fields } from '../../ui/test-disclosure';
import { useLabels } from './labels';

export function TUnitTraceTimeline({ spans }: { spans: TUnitSpan[] }) {
  const labels = useLabels();
  const origin = Math.min(...spans.map((span) => span.startTimeMs));
  const extent = Math.max(...spans.map((span) => span.startTimeMs + span.durationMs)) - origin || 1;
  const byId = new Map(spans.map((span) => [`${span.traceId}:${span.spanId}`, span]));
  function depth(span: TUnitSpan) {
    const seen = new Set<string>();
    let current: TUnitSpan | undefined = span;
    let level = 0;
    while (current?.parentSpanId && level < 8) {
      const key = `${current.traceId}:${current.parentSpanId}`;
      if (seen.has(key)) break;
      seen.add(key);
      current = byId.get(key);
      if (current) level++;
    }
    return level;
  }
  return (
    <Accordion className="ftr-traces" multiple>
      {spans
        .toSorted((a, b) => a.startTimeMs - b.startTimeMs)
        .map((span) => (
          <AccordionItem
            className="ftr-span"
            key={`${span.traceId}:${span.spanId}`}
            value={`${span.traceId}:${span.spanId}`}
          >
            <AccordionHeader className="ftr-span-header">
              <AccordionTrigger className="ftr-span-trigger">
                <span className="ftr-span-heading">
                  <span
                    className="ftr-span-name"
                    style={{ paddingInlineStart: `${depth(span) * 0.75}rem` }}
                    data-error={span.status === 'Error' || undefined}
                  >
                    {span.name}
                  </span>
                  <span
                    className="ftr-track"
                    aria-hidden="true"
                    data-error={span.status === 'Error' || undefined}
                  >
                    <span
                      style={{
                        insetInlineStart: `${((span.startTimeMs - origin) / extent) * 100}%`,
                        width: `${(span.durationMs / extent) * 100}%`,
                      }}
                    />
                  </span>
                  <small>
                    <Duration value={span.durationMs} unknownLabel={labels.unknown} />
                  </small>
                </span>
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>
              <div className="ftr-span-detail">
                <Fields
                  items={[
                    { label: labels.traceId, value: span.traceId, mono: true },
                    { label: labels.spanId, value: span.spanId, mono: true },
                    { label: labels.parentId, value: span.parentSpanId || undefined, mono: true },
                    { label: labels.traceSource, value: span.source || undefined },
                    { label: labels.kind, value: span.kind || undefined },
                    {
                      label: labels.status,
                      value:
                        span.status &&
                        `${span.status}${span.statusMessage ? `: ${span.statusMessage}` : ''}`,
                    },
                    ...(span.tags ?? []).map((tag) => ({ label: tag.key, value: tag.value })),
                  ]}
                />
                {!!span.events?.length && (
                  <StdoutPanel
                    content={JSON.stringify(span.events, null, 2)}
                    title={labels.events}
                  />
                )}
                {!!span.links?.length && (
                  <StdoutPanel content={JSON.stringify(span.links, null, 2)} title={labels.links} />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  );
}
