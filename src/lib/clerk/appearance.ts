import type { ClerkProvider } from '@clerk/nextjs';
import type { ComponentProps } from 'react';

type ClerkAppearance = ComponentProps<typeof ClerkProvider>['appearance'];

/**
 * Global look for every Clerk component (sign-in, sign-up, account modal).
 *
 * Colours point at our CSS variables rather than hex values, so Clerk follows
 * light/dark mode the same way the rest of the app does. Brand blue is the
 * primary colour and brand teal is the focus ring and link colour.
 *
 * `cssLayerName` puts Clerk's CSS in the `clerk` layer declared in
 * `globals.css`, which lets the Tailwind classes in `elements` override it.
 *
 * The "Secured by Clerk" footer stays - removing it needs a paid Clerk plan.
 *
 * @example
 * ```tsx
 * <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
 * ```
 */
export const clerkAppearance: ClerkAppearance = {
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: 'var(--brand)',
    colorPrimaryForeground: 'var(--brand-foreground)',
    colorRing: 'var(--brand-accent)',
    colorForeground: 'var(--foreground)',
    colorMutedForeground: 'var(--muted-foreground)',
    colorMuted: 'var(--muted)',
    colorBackground: 'var(--card)',
    /*
     * Muted, not the card colour - a white input on a white card doesn't read
     * as a field you can type in.
     */
    colorInput: 'var(--muted)',
    colorInputForeground: 'var(--foreground)',
    colorBorder: 'var(--border)',
    colorNeutral: 'var(--foreground)',
    colorDanger: 'var(--destructive)',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-sans)',
  },
  elements: {
    cardBox: 'border-t-4 border-t-brand shadow-sm',
    footerActionLink: 'text-brand-accent hover:text-brand-accent/80',
  },
};
