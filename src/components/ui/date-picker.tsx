'use client';

import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDate, parseDateSafe } from '@/utils/dates';
import { cn } from '@/utils/tailwind-merge';

type DatePickerProps = {
  /** The selected date as a YYYY-MM-DD string, or undefined when unset. */
  value: string | undefined;
  /** Called with a YYYY-MM-DD string when a date is selected, or undefined when cleared. */
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * Controlled date picker built from shadcn Calendar and Popover.
 *
 * Accepts and emits dates as YYYY-MM-DD strings so the form layer never
 * handles raw Date objects. Uses `parseDateSafe` internally to avoid the
 * JS UTC-midnight gotcha — the displayed date always matches the stored string
 * regardless of the user's timezone.
 *
 * @param value - Selected date as YYYY-MM-DD, or undefined when unset.
 * @param onChange - Called with YYYY-MM-DD on selection, or undefined on clear.
 * @param placeholder - Trigger button text when no date is selected.
 * @param disabled - Disables the trigger button when true.
 * @example
 * ```tsx
 * <DatePicker
 *   value={field.value ?? null}
 *   onChange={field.onChange}
 *   placeholder='Pick an expiry date'
 * />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
}: DatePickerProps) {
  const selected = value ? (parseDateSafe(value) ?? undefined) : undefined;

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? formatDate(date, 'iso') : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value ? formatDate(parseDateSafe(value)!, 'display') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar mode='single' selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
