'use client';

import { useTheme } from 'next-themes';
import { Toaster, type ToasterProps } from 'sonner';

/**
 * App-wide toast surface (sonner). Mounted once in the root layout; toasts are
 * then triggered from anywhere with `toast(...)` from `sonner` — you never
 * render this component again.
 *
 * Mirrors the active next-themes value so toasts match light/dark/system.
 *
 * @example
 * ```tsx
 * // Mount once (already wired in the root layout):
 * <AppToaster position='top-right' richColors />
 *
 * // Trigger from any client component:
 * import { toast } from 'sonner';
 * toast.success('Saved');
 * ```
 */
export function AppToaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Toaster theme={theme as ToasterProps['theme']} closeButton {...props} />
  );
}
