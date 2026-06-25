import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { AppToaster } from '@/components/common/toast';
import { cn } from '@/utils/tailwind-merge';

/*
 * Clerk reads the publishable key from `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
 * automatically — we never pass it explicitly.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SELF-HOSTING / DOCKER CAVEAT — read before changing how the key is supplied
 * ─────────────────────────────────────────────────────────────────────────
 * `NEXT_PUBLIC_*` vars are INLINED INTO THE CLIENT BUNDLE AT BUILD TIME, not
 * read at runtime. On Vercel this is fine: each environment is built with its
 * own env vars present, so the correct key is baked in.
 *
 * It breaks when you build ONE Docker image and promote it across environments
 * (or inject env only at `docker run` / k8s deploy time). The key is fixed at
 * `next build`, so a runtime-provided `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` never
 * reaches the bundle — the client ends up with whatever value (often empty)
 * existed during the build.
 *
 * If you hit that, make the key a RUNTIME value instead:
 *   1. Expose it from a server route (e.g. `GET /api/clerk/publishable-key`)
 *      that reads a NON-`NEXT_PUBLIC` env var (`CLERK_PUBLISHABLE_KEY`) at
 *      request time.
 *   2. In a client wrapper, fetch it, hold it in state, and only mount
 *      `<ClerkProvider publishableKey={key}>` once it resolves (show a loader
 *      until then).
 * That trades build-time simplicity for runtime configurability. This template
 * defaults to the build-time path because it targets Vercel; switch to the
 * runtime path only when your hosting forces it.
 */

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Next Template',
  description: 'Full Stack Next Project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('h-full font-sans antialiased', inter.variable)}
    >
      <body className='flex min-h-full flex-col'>
        <ClerkProvider>
          <ThemeProvider
            attribute='class'
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <AppToaster position='top-right' richColors />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
