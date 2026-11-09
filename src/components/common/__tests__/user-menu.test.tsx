import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserMenu } from '@/components/common/user-menu';

/*
 * Clerk hooks need a live ClerkProvider, so we mock them. That lets us pick
 * the signed-in user and capture the Clerk calls the menu makes.
 */
const openUserProfile = vi.fn();
const signOut = vi.fn();
const signedInUser = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  fullName: 'Ada Lovelace',
  hasImage: false,
  imageUrl: '',
  primaryEmailAddress: { emailAddress: 'ada@example.com' },
};
let currentUser: typeof signedInUser | null = signedInUser;

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: currentUser }),
  useClerk: () => ({ openUserProfile, signOut }),
}));

afterEach(() => {
  openUserProfile.mockClear();
  signOut.mockClear();
  currentUser = signedInUser;
});

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Open user menu' }));
  return user;
};

describe('UserMenu', () => {
  it('renders nothing when there is no user', () => {
    currentUser = null;
    render(<UserMenu />);

    expect(
      screen.queryByRole('button', { name: 'Open user menu' }),
    ).not.toBeInTheDocument();
  });

  it('shows the repo docs link only when a docs URL is set', async () => {
    const { unmount } = render(<UserMenu />);
    await openMenu();
    expect(
      screen.queryByRole('menuitem', { name: /repo docs/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /api docs/i })).toHaveAttribute(
      'href',
      '/api-docs',
    );
    unmount();

    render(<UserMenu docsUrl='https://docs.example.com' />);
    await openMenu();
    expect(
      screen.getByRole('menuitem', { name: /repo docs/i }),
    ).toHaveAttribute('href', 'https://docs.example.com');
  });

  it('opens the Clerk profile from manage account', async () => {
    render(<UserMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: /manage account/i }));

    expect(openUserProfile).toHaveBeenCalledOnce();
  });

  it('signs out back to the sign-in page', async () => {
    render(<UserMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole('menuitem', { name: /sign out/i }));

    expect(signOut).toHaveBeenCalledExactlyOnceWith({
      redirectUrl: '/sign-in',
    });
  });
});
