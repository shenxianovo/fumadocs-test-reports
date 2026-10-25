import type { ReactNode } from 'react';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

/** Visual tone only; the presenter owns the meaning of the framework's status. */
export type BadgeTone = 'success' | 'danger' | 'neutral' | 'info';

export interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ status, tone = 'neutral', className = '' }: StatusBadgeProps) {
  return (
    <span className={`ftr-ui ftr-badge ftr-tone-${tone} ${className}`}>
      <ToneGlyph tone={tone} />
      {status}
    </span>
  );
}

export interface StatusIconProps {
  status: string;
  tone?: BadgeTone;
  className?: string;
}

/** A fixed-width status mark; the caller's status label stays available to assistive technology. */
export function StatusIcon({ status, tone = 'neutral', className = '' }: StatusIconProps) {
  return (
    <span
      className={`ftr-ui ftr-status-icon ftr-tone-${tone} ${className}`}
      role="img"
      aria-label={status}
      title={status}
    >
      <ToneGlyph tone={tone} />
    </span>
  );
}

function ToneGlyph({ tone }: { tone: BadgeTone }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="ftr-glyph">
      {tone === 'success' ? (
        <path d="M4.5 8.25 7 10.75l4.5-5" />
      ) : tone === 'danger' ? (
        <path d="m5.5 5.5 5 5m0-5-5 5" />
      ) : tone === 'info' ? (
        <path d="M8 5v3l2 1.5" />
      ) : (
        <path d="M5.25 8h5.5" />
      )}
    </svg>
  );
}

export interface DurationProps {
  /** Milliseconds. Missing or null means unknown; zero is a known zero. */
  value?: number | null;
  unknownLabel?: string;
  className?: string;
}

export function Duration({ value, unknownLabel = 'Unknown', className }: DurationProps) {
  const text =
    value == null
      ? unknownLabel
      : value >= 1000
        ? `${(value / 1000).toFixed(2)} s`
        : `${value.toFixed(1)} ms`;
  return <span className={`ftr-duration ${className ?? ''}`}>{text}</span>;
}

export interface ErrorDetailProps {
  message?: string | null;
  type?: string | null;
  stack?: string | null;
  children?: ReactNode;
}

export function ErrorDetail({ message, type, stack, children }: ErrorDetailProps) {
  return (
    <div className="ftr-ui ftr-error" role="group" aria-label={type ?? undefined}>
      {type != null && (
        <p className="ftr-error-type">
          <ToneGlyph tone="danger" />
          <span className="ftr-mono">{type}</span>
        </p>
      )}
      {message != null && <pre className="ftr-error-message">{message}</pre>}
      {stack != null && <pre className="ftr-error-stack">{stack}</pre>}
      {children}
    </div>
  );
}

export interface StdoutPanelProps {
  content?: string | null;
  title?: string;
  emptyLabel?: string;
}

/** Plain text only, suitable for stdout or stderr. */
export function StdoutPanel({
  content,
  title,
  emptyLabel = 'No output recorded.',
}: StdoutPanelProps) {
  return (
    <div className="ftr-ui ftr-output-panel">
      {content == null ? (
        <p className="ftr-empty">{emptyLabel}</p>
      ) : (
        <CodeBlock title={title} className="ftr-codeblock">
          <Pre>
            <code>{content}</code>
          </Pre>
        </CodeBlock>
      )}
    </div>
  );
}
