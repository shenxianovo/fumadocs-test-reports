import type { ReactNode } from 'react';
import { Callout } from 'fumadocs-ui/components/callout';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

/** Visual tone only; the presenter owns the meaning of the framework's status. */
export type BadgeTone = 'success' | 'danger' | 'neutral' | 'info';

export interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ status, tone = 'neutral', className = '' }: StatusBadgeProps) {
  return <span className={`ftr-ui ftr-badge ftr-tone-${tone} ${className}`}>{status}</span>;
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
  return <span className={className}>{text}</span>;
}

export interface ErrorDetailProps {
  message?: string | null;
  type?: string | null;
  stack?: string | null;
  children?: ReactNode;
}

export function ErrorDetail({ message, type, stack, children }: ErrorDetailProps) {
  return (
    <Callout type="error" title={type ?? undefined} className="ftr-ui ftr-error-details">
      {message != null && <p className="ftr-error-message">{message}</p>}
      {stack != null && <StdoutPanel content={stack} />}
      {children}
    </Callout>
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
