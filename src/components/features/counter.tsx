'use client';

import { Button } from '@/components/ui/button';
import { useCounterStore } from '@/store/counter-store';

/**
 * EXAMPLE COMPONENT
 *
 * A minimal counter wired to `useCounterStore`.
 *
 * @example
 * ```tsx
 * <Counter />
 * ```
 */
export function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <div className='flex flex-col items-center gap-4'>
      <p className='text-2xl font-semibold tabular-nums' aria-live='polite'>
        Count: {count}
      </p>
      <div className='flex gap-2'>
        <Button size='sm' onClick={increment}>
          Increment
        </Button>
        <Button variant='outline' size='sm' onClick={decrement}>
          Decrement
        </Button>
        <Button variant='ghost' size='sm' onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
