import { create } from 'zustand';

/*
 * EXAMPLE STORE — demonstrates the Zustand pattern used across this template.
 * Exists for testing and learning, not production use.
 *
 * Type pattern: split the data shape (`CounterState`) from the behaviours
 * (`CounterActions`), then intersect them into the public store type
 * (`CounterStore`). The split lets us derive a fully-typed `defaultCounterState`
 * from the state shape alone, and keeps actions readable in isolation. Types are
 * co-located here rather than in `store/types/` because nothing else consumes
 * them — pull them up to `types/` only once a second module needs them.
 */

type CounterState = {
  count: number;
};

type CounterActions = {
  /** Increment the count by one. */
  increment: () => void;
  /** Increment the count by one after a short delay (async example). */
  incrementAsync: () => Promise<void>;
  /** Decrement the count by one. */
  decrement: () => void;
  /** Reset the count back to its default. */
  reset: () => void;
};

/** The full public shape of the counter store: state plus actions. */
export type CounterStore = CounterState & CounterActions;

/**
 * The initial state for the counter store.
 *
 * Derived from `CounterState` alone so the defaults can never drift out of sync
 * with the state shape — adding a state field forces a default for it here.
 */
export const defaultCounterState: CounterState = {
  count: 0,
};

/** Delay (ms) used by `incrementAsync` to simulate an async operation. */
const ASYNC_INCREMENT_DELAY_MS = 300;

/**
 * EXAMPLE STORE
 *
 * A minimal counter demonstrating the Zustand store pattern.
 *
 * @example
 * ```tsx
 * const count = useCounterStore((state) => state.count);
 * const increment = useCounterStore((state) => state.increment);
 * ```
 */
export const useCounterStore = create<CounterStore>()((set) => ({
  ...defaultCounterState,
  increment: () => set((state) => ({ count: state.count + 1 })),
  incrementAsync: async () => {
    await new Promise((resolve) =>
      setTimeout(resolve, ASYNC_INCREMENT_DELAY_MS),
    );
    set((state) => ({ count: state.count + 1 }));
  },
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set(defaultCounterState),
}));
