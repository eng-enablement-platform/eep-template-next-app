/**
 * Global Clerk session-claims augmentation.
 *
 * Clerk reads custom claims off the session JWT but cannot know their shape, so
 * `sessionClaims.metadata` is `{}` until we declare it here. We surface a
 * `role` claim used by the middleware to gate app access and by the API layer
 * to authorise writes.
 *
 * The template ships a two-role model: `Admin` gets into the app and can read;
 * `SuperAdmin` is a strict superset that can also write (POST/PATCH/DELETE).
 * The role hierarchy lives in `@/app/api/utils` (`hasRole`).
 *
 * Set the matching value in the Clerk Dashboard under Sessions, customize the
 * session token, so the claim is present at runtime. Map the `metadata` claim
 * to the user's public metadata via the dashboard's session-token editor.
 *
 * @see https://clerk.com/docs/references/nextjs/read-session-data
 */
export {};

export type UserRole = 'Admin' | 'SuperAdmin';

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
  }
}
