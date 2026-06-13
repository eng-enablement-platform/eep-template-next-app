/**
 * Global Clerk session-claims augmentation.
 *
 * Clerk reads custom claims off the session JWT but cannot know their shape, so
 * `sessionClaims.metadata` is `{}` until we declare it here. We surface a
 * `role` claim used by the middleware to gate admin-only routes.
 *
 * Set the matching value in the Clerk Dashboard under Sessions, customize the
 * session token, so the claim is present at runtime. Map the `metadata` claim
 * to the user's public metadata via the dashboard's session-token editor.
 *
 * @see https://clerk.com/docs/references/nextjs/read-session-data
 */
export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: 'Admin';
    };
  }
}
