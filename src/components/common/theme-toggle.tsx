'use client';
import { MoonIcon, SunIcon, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ToggleProps = {
  displayName?: string;
};

/**
 * Dropdown for switching between light, dark, and system themes (next-themes).
 *
 * @param displayName - Optional label rendered beside the toggle icon.
 * @example
 * ```tsx
 * <ThemeToggle displayName='Theme' />
 * ```
 */
export function ThemeToggle({ displayName }: ToggleProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  /*
   * next-themes can only resolve the active theme on the client, so the first
   * server render must not commit theme-dependent markup. Flipping `mounted`
   * after mount is the documented guard against the resulting hydration
   * mismatch — a one-shot mount effect, not a render-driven state sync.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only hydration guard, see comment above
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost'>
          {theme === 'system' ? (
            <SunMoon data-testid='system-theme-icon' />
          ) : theme === 'dark' ? (
            <MoonIcon data-testid='dark-theme-icon' />
          ) : (
            <SunIcon data-testid='light-theme-icon' />
          )}
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
        side='right'
        align='end'
        sideOffset={4}
      >
        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onClick={() => setTheme('system')}
        >
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onClick={() => setTheme('light')}
        >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onClick={() => setTheme('dark')}
        >
          Dark
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
