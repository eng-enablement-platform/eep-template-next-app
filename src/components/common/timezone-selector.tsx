'use client';

import { GlobeIcon } from 'lucide-react';

import { DEMO_TIMEZONES, useTimezoneStore } from '@/store/timezone-store';

/**
 * Dev-only timezone selector for the date timezone demo.
 *
 * Renders only in development — invisible in production builds. Shows today's
 * date formatted in the selected timezone alongside the selector. Switching
 * timezone causes the date to re-render live, making it immediately obvious
 * how the same moment-in-time displays as a different calendar date across
 * timezones — particularly near day boundaries.
 *
 * @example
 * ```tsx
 * <TimezoneSelector />
 * ```
 */
export function TimezoneSelector() {
  const { selectedTimezone, setTimezone } = useTimezoneStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: selectedTimezone,
  }).format(new Date());

  return (
    <div className='flex items-center gap-2'>
      <GlobeIcon className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
      <select
        value={selectedTimezone}
        onChange={(e) => setTimezone(e.target.value)}
        className='text-muted-foreground hover:text-foreground cursor-pointer bg-transparent text-xs transition-colors focus:outline-none'
        aria-label='Demo timezone'
      >
        {DEMO_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
      <span className='text-muted-foreground/60 border-border border-l pl-2 font-mono text-xs'>
        {todayFormatted}
      </span>
    </div>
  );
}
