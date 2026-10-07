'use client';

import type { ReactNode } from 'react';
import {
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'fumadocs-ui/components/ui/accordion';

/** Display composition only; each presenter owns its native data and selection. */
export function TestDisclosure({
  value,
  badge,
  name,
  duration,
  children,
}: {
  value: string;
  badge: ReactNode;
  name: ReactNode;
  duration: ReactNode;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionHeader>
        <AccordionTrigger className="ftr-test">
          {badge}
          <span className="ftr-test-name">{name}</span>
          <small>{duration}</small>
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>
        <div className="ftr-detail">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
