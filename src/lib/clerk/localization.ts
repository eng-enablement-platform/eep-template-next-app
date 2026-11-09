import type { ClerkProvider } from '@clerk/nextjs';
import type { ComponentProps } from 'react';

type ClerkLocalization = ComponentProps<typeof ClerkProvider>['localization'];

/**
 * Text overrides for Clerk's prebuilt components.
 *
 * The sign-in title is blanked because our page already says what it is (EEP
 * logo and "Next.js Template" above the card), and Clerk's default reads "Sign
 * in to" plus the app name from the Clerk dashboard, which is "My Application" on a fresh Clerk app.
 * Only the first step is touched - later steps like "Check your email" keep
 * their titles.
 *
 * @example
 * ```tsx
 * <ClerkProvider localization={clerkLocalization}>{children}</ClerkProvider>
 * ```
 */
export const clerkLocalization: ClerkLocalization = {
  signIn: {
    start: {
      title: '',
    },
  },
};
