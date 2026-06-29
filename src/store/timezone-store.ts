import { create } from 'zustand';

/*
 * IANA timezones used by the dev timezone selector. Chosen to cover UTC, a
 * negative-offset zone (Denver UTC-7), a standard US zone (New York UTC-5),
 * and a positive-offset zone (Auckland UTC+12) - enough to demonstrate the
 * UTC-midnight date shift bug in both directions.
 */
export const DEMO_TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Denver (UTC−7)', value: 'America/Denver' },
  { label: 'New York (UTC−5)', value: 'America/New_York' },
  { label: 'Auckland (UTC+12)', value: 'Pacific/Auckland' },
] as const;

export type DemoTimezone = (typeof DEMO_TIMEZONES)[number]['value'];

/*
 * Locales shown in the date format preview table. Chosen to cover the three
 * most common conventions: DD Mon YYYY (en-GB), MM/DD/YYYY (en-US - the
 * inversion that breaks HubSpot/Jira integrations), DD.MM.YYYY (de-DE), and
 * DD/MM/YYYY (fr-FR).
 */
export const DEMO_LOCALES = [
  { label: 'en-GB', value: 'en-GB', format: 'DD Mon YYYY' },
  { label: 'en-US', value: 'en-US', format: 'MM/DD/YYYY' },
  { label: 'de-DE', value: 'de-DE', format: 'DD.MM.YYYY' },
  { label: 'fr-FR', value: 'fr-FR', format: 'DD/MM/YYYY' },
] as const;

type TimezoneState = {
  selectedTimezone: string;
};

type TimezoneActions = {
  /** Update the active display timezone. */
  setTimezone: (timezone: string) => void;
};

/** The full public shape of the timezone store: state plus actions. */
export type TimezoneStore = TimezoneState & TimezoneActions;

/**
 * The initial state for the timezone store.
 *
 * Defaults to UTC so date display is deterministic on first render before
 * the user switches timezone.
 */
export const defaultTimezoneState: TimezoneState = {
  selectedTimezone: 'UTC',
};

/**
 * EXAMPLE STORE
 *
 * Holds the active display timezone for the dev timezone demo. The selector
 * in the navbar writes here; date rendering in the item list reads from here
 * and re-renders reactively when the timezone changes.
 *
 * Dev-only concern - not used in production features.
 *
 * @example
 * ```tsx
 * const { selectedTimezone, setTimezone } = useTimezoneStore();
 * ```
 */
export const useTimezoneStore = create<TimezoneStore>()((set) => ({
  ...defaultTimezoneState,
  setTimezone: (timezone) => set({ selectedTimezone: timezone }),
}));
