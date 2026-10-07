'use client';

import type { TUnitSpan } from '../types';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Duration, StdoutPanel } from '../../ui';
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
    <Accordions className="ftr-traces">
      {spans
        .toSorted((a, b) => a.startTimeMs - b.startTimeMs)
        .map((span) => (
          <Accordion
            className="ftr-span"
            key={`${span.traceId}:${span.spanId}`}
            value={`${span.traceId}:${span.spanId}`}
            title={
              <span className="ftr-span-heading">
                <span style={{ paddingInlineStart: `${depth(span) * 12}px` }}>{span.name}</span>
                <small>
                  <Duration value={span.durationMs} unknownLabel={labels.unknown} />
                </small>
                <span className="ftr-track" aria-hidden="true">
                  <span
                    style={{
                      marginInlineStart: `${((span.startTimeMs - origin) / extent) * 100}%`,
                      width: `${(span.durationMs / extent) * 100}%`,
                    }}
                  />
                </span>
              </span>
            }
          >
            <dl className="ftr-fields">
              <dt>{labels.traceId}</dt>
              <dd>{span.traceId}</dd>
              <dt>{labels.spanId}</dt>
              <dd>{span.spanId}</dd>
              {span.parentSpanId && (
                <>
                  <dt>{labels.parentId}</dt>
                  <dd>{span.parentSpanId}</dd>
                </>
              )}
              {span.source && (
                <>
                  <dt>{labels.traceSource}</dt>
                  <dd>{span.source}</dd>
                </>
              )}
              {span.kind && (
                <>
                  <dt>{labels.kind}</dt>
                  <dd>{span.kind}</dd>
                </>
              )}
              {span.status && (
                <>
                  <dt>{labels.status}</dt>
                  <dd>
                    {span.status}
                    {span.statusMessage ? `: ${span.statusMessage}` : ''}
                  </dd>
                </>
              )}
              {span.tags?.map((tag, i) => (
                <div className="ftr-field" key={i}>
                  <dt>{tag.key}</dt>
                  <dd>{tag.value}</dd>
                </div>
              ))}
            </dl>
            {!!span.events?.length && (
              <StdoutPanel content={JSON.stringify(span.events, null, 2)} title={labels.events} />
            )}
            {!!span.links?.length && (
              <StdoutPanel content={JSON.stringify(span.links, null, 2)} title={labels.links} />
            )}
          </Accordion>
        ))}
    </Accordions>
  );
}
