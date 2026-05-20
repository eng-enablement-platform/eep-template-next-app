import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class values into a single string of class names.
 * @param inputs - The class values to merge.
 * @example
 * ```ts
 * cn('text-red-500', 'bg-blue-500');
 * // 'text-red-500 bg-blue-500'
 * ```
 * @returns The merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
