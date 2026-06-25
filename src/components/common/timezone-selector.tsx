'use client';

import { GlobeIcon } from 'lucide-react';

import { DEMO_TIMEZONES, useTimezoneStore } from '@/store/timezone-store';

/**
 * Dev-only timezone selector for the date timezone demo.
 *
 * Renders only in development — invisible in production builds. Changing the
 * timezone updates the Zustand store, which causes any component reading
 * `useTimezoneStore` to re-render with dates formatted in the new timezone.
 * This makes the UTC-midnight date shift bug visually demonstrable without
 * restarting the dev server.
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

  return (
    <div className='flex items-center gap-1.5'>
      <GlobeIcon className='text-muted-foreground h-3.5 w-3.5' />
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
    </div>
  );
}
