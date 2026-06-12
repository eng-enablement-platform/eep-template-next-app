import { describe, expect, it } from 'vitest';

import { defaultCounterState, useCounterStore } from '@/store/counter-store';

/*
 * Zustand stores are module singletons, so each test resets to the default
 * state first to stay independent of execution order. `getState`/`setState`
 * let us drive the store without rendering a React tree.
 */
describe('useCounterStore', () => {
  const resetStore = () => {
    useCounterStore.setState(defaultCounterState);
  };

  it('starts at the default count', () => {
    resetStore();

    expect(useCounterStore.getState().count).toBe(defaultCounterState.count);
  });

  it('increments and decrements by one', () => {
    resetStore();

    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(2);

    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it('resets back to the default state', () => {
    resetStore();

    useCounterStore.getState().increment();
    useCounterStore.getState().reset();

    expect(useCounterStore.getState().count).toBe(defaultCounterState.count);
  });

  it('increments asynchronously', async () => {
    resetStore();

    await useCounterStore.getState().incrementAsync();

    expect(useCounterStore.getState().count).toBe(1);
  });
});
