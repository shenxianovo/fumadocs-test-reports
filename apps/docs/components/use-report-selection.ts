'use client';

import { useSearchParams } from 'next/navigation';

/** URL state belongs to the host; expanding a test does not load another report. */
export function useReportSelection() {
  const search = useSearchParams();

  function selectTest(id: string | undefined) {
    const url = new URL(window.location.href);
    if (id === undefined) url.searchParams.delete('test');
    else url.searchParams.set('test', id);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  return { selectedTestId: search.get('test'), selectTest };
}
