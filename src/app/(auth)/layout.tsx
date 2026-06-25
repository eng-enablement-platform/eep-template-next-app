import type { ReactNode } from 'react';

/*
 * Bare layout for auth routes (/sign-in, /sign-up). No navbar, no auth gate —
 * Clerk's own flows render directly without any app shell around them.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
