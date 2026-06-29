import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/components/common/theme-toggle';

/*
 * next-themes resolves the theme on the client via context we don't render in
 * tests, so we mock the `useTheme` hook. This lets us (a) drive the component
 * with a known active theme and (b) capture setTheme calls - i.e. assert
 * BEHAVIOUR (which icon shows, what a click does) rather than markup.
 */
const setTheme = vi.fn();
let activeTheme = 'system';

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: activeTheme, setTheme }),
}));

afterEach(() => {
  setTheme.mockClear();
  activeTheme = 'system';
});

describe('ThemeToggle', () => {
  it('shows the icon matching the active theme', () => {
    activeTheme = 'dark';
    render(<ThemeToggle />);

    // Branch under test: theme === 'dark' renders the moon icon, not sun/system.
    expect(screen.getByTestId('dark-theme-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('light-theme-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('system-theme-icon')).not.toBeInTheDocument();
  });

  it('calls setTheme with the chosen option', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Open the dropdown, then pick "Dark".
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Dark'));

    expect(setTheme).toHaveBeenCalledExactlyOnceWith('dark');
  });

  it('renders the optional displayName label', () => {
    render(<ThemeToggle displayName='Theme' />);

    expect(screen.getByText('Theme')).toBeInTheDocument();
  });
});
