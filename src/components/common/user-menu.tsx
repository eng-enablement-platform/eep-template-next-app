'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { BookOpen, ExternalLink, FileText, LogOut, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/get-initials';

type UserMenuProps = {
  docsUrl?: string;
};

/**
 * Avatar button and account dropdown, used in place of Clerk's `UserButton`.
 *
 * Ours so it matches the rest of the UI and carries the docs links. "Manage
 * account" still opens Clerk's profile modal, so we don't rebuild account
 * settings. Shows the user's photo only when they have uploaded one - Clerk's
 * generated default avatar is swapped for initials on the brand colour.
 *
 * @param docsUrl - Repo docs link. The item is hidden when it is not set.
 * @example
 * ```tsx
 * <UserMenu docsUrl={env.NEXT_PUBLIC_DOCS_URL} />
 * ```
 */
export function UserMenu({ docsUrl }: UserMenuProps) {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  /*
   * RootLayoutClient waits for Clerk before rendering the navbar, so this is
   * only a guard for the brief moment after sign out.
   */
  if (!user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const initials = getInitials({
    firstName: user.firstName,
    lastName: user.lastName,
    email,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='Open user menu'
        className='ring-brand-accent ring-offset-background focus-visible:ring-ring rounded-full ring-2 ring-offset-2 outline-none'
      >
        <Avatar>
          {user.hasImage && <AvatarImage src={user.imageUrl} alt='' />}
          <AvatarFallback className='bg-brand text-brand-foreground text-xs font-medium'>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='flex flex-col'>
          <span className='truncate text-sm font-medium'>
            {user.fullName ?? email}
          </span>
          {user.fullName && email && (
            <span className='text-muted-foreground truncate text-xs font-normal'>
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => openUserProfile()}>
          <User />
          Manage account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {docsUrl && (
            <DropdownMenuItem asChild>
              <a href={docsUrl} target='_blank' rel='noopener noreferrer'>
                <FileText />
                Repo docs
                <ExternalLink className='text-muted-foreground ml-auto' />
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href='/api-docs' target='_blank' rel='noopener noreferrer'>
              <BookOpen />
              API docs
              <ExternalLink className='text-muted-foreground ml-auto' />
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onSelect={() => signOut({ redirectUrl: '/sign-in' })}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
