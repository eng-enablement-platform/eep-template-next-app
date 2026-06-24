/*
 * Empty stub for the `server-only` package in the vitest environment.
 *
 * `server-only` exists solely to trigger a Next.js build error when server
 * code leaks into the client bundle. That guard is a build-time concern —
 * vitest does not need to enforce it, and the real package has no exports,
 * so an empty module is the correct replacement.
 */
export {};
