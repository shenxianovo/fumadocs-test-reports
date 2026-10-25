import type { ReactNode } from 'react';
import type { BadgeTone } from './primitives';

export interface SummaryMetric {
  label: ReactNode;
  value: ReactNode;
  /** Omit for counts that need no emphasis, such as zero failures. */
  tone?: BadgeTone;
  note?: ReactNode;
}

export interface SummarySegment {
  key: string;
  label: string;
  count: number;
  tone: BadgeTone;
}

const toneOrder: BadgeTone[] = ['success', 'danger', 'info', 'neutral'];

/** Proportional outcome bar; tones are display hints from the presenter. */
export function DistributionBar({
  segments,
  className = '',
}: {
  segments: SummarySegment[];
  className?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  return (
    <div className={`ftr-ui ftr-bar ${className}`} aria-hidden="true">
      {total > 0 &&
        segments
          .filter((segment) => segment.count > 0)
          .toSorted((a, b) => toneOrder.indexOf(a.tone) - toneOrder.indexOf(b.tone))
          .map((segment) => (
            <span
              key={segment.key}
              data-tone={segment.tone}
              title={`${segment.label}: ${segment.count}`}
              style={{ flexGrow: segment.count }}
            />
          ))}
    </div>
  );
}

export function RunSummary({
  metrics,
  segments,
}: {
  metrics: SummaryMetric[];
  segments: SummarySegment[];
}) {
  return (
    <div className="ftr-ui ftr-summary-card">
      <dl className="ftr-metrics">
        {metrics.map((metric, i) => (
          <div key={i} data-tone={metric.tone}>
            <dt>{metric.label}</dt>
            <dd>
              <strong>{metric.value}</strong>
              {metric.note != null && <small>{metric.note}</small>}
            </dd>
          </div>
        ))}
      </dl>
      <DistributionBar segments={segments} />
    </div>
  );
}
