import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  describeDatabaseConnectionError,
  handleScriptError,
} from '@/db/connection-errors';

const LOCAL_URL = 'postgresql://postgres:postgres@localhost:5432/app';
const REMOTE_URL = 'postgresql://user:pass@db.example.neon.tech:5432/prod';

// A Postgres driver error (pg's DatabaseError carries a SQLSTATE `code`).
const pgError = (code: string, message: string) =>
  Object.assign(new Error(message), { code });

// How Drizzle surfaces it: a "Failed query" error with the driver error as cause.
const drizzleError = (cause: Error) =>
  new Error('Failed query: CREATE SCHEMA IF NOT EXISTS "drizzle"', { cause });

// How Node reports a refused connection to localhost (one attempt per IP family).
const refusedError = () =>
  Object.assign(
    new AggregateError(
      [
        Object.assign(new Error('connect ECONNREFUSED ::1:5433'), {
          code: 'ECONNREFUSED',
        }),
        Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5433'), {
          code: 'ECONNREFUSED',
        }),
      ],
      '',
    ),
    { code: 'ECONNREFUSED' },
  );

describe('describeDatabaseConnectionError', () => {
  it('explains a missing database as a likely port clash, locally', () => {
    const advice = describeDatabaseConnectionError(
      drizzleError(pgError('3D000', 'database "app" does not exist')),
      LOCAL_URL,
    );

    expect(advice).toContain(
      'Connected to Postgres on localhost:5432, but it has no "app" database',
    );
    expect(advice).toContain("Is that another project's Postgres?");
    expect(advice).toContain('POSTGRES_PORT=5433');
    expect(advice).toContain('pnpm db:up');
  });

  it('explains a rejected login as a likely port clash, locally', () => {
    const advice = describeDatabaseConnectionError(
      drizzleError(pgError('28P01', 'password authentication failed')),
      LOCAL_URL,
    );

    expect(advice).toContain('the login was rejected');
    expect(advice).toContain("Is that another project's Postgres?");
  });

  it('explains a refused connection, using the port from DATABASE_URL', () => {
    const advice = describeDatabaseConnectionError(
      drizzleError(refusedError()),
      'postgresql://postgres:postgres@localhost:5433/app',
    );

    expect(advice).toContain(
      'Nothing is accepting connections on localhost:5433',
    );
    expect(advice).toContain('pnpm db:up');
  });

  it('gives DATABASE_URL advice, not docker advice, for a remote host', () => {
    const advice = describeDatabaseConnectionError(
      drizzleError(pgError('3D000', 'database "prod" does not exist')),
      REMOTE_URL,
    );

    expect(advice).toContain('db.example.neon.tech:5432');
    expect(advice).toContain('Check the database name in DATABASE_URL');
    expect(advice).not.toContain('POSTGRES_PORT');
  });

  it('returns undefined for errors it does not recognise', () => {
    expect(
      describeDatabaseConnectionError(
        drizzleError(pgError('42P01', 'relation "x" does not exist')),
        LOCAL_URL,
      ),
    ).toBeUndefined();
    expect(describeDatabaseConnectionError('boom', LOCAL_URL)).toBeUndefined();
  });

  it('falls back to defaults when DATABASE_URL is missing or invalid', () => {
    expect(
      describeDatabaseConnectionError(
        pgError('3D000', 'database "app" does not exist'),
        undefined,
      ),
    ).toContain('the database host:5432');
  });
});

describe('handleScriptError', () => {
  const exit = vi
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterEach(() => {
    vi.unstubAllEnvs();
    exit.mockClear();
    consoleError.mockClear();
  });

  it('prints the advice for a recognised problem and exits 1', () => {
    vi.stubEnv('DATABASE_URL', LOCAL_URL);

    handleScriptError('DB migrations failed')(
      drizzleError(pgError('3D000', 'database "app" does not exist')),
    );

    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError.mock.calls[0]?.[0]).toMatch(
      /^DB migrations failed: Connected to Postgres on localhost:5432/,
    );
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('prints the full error for anything else and exits 1', () => {
    const error = new Error('something else');

    handleScriptError('Seed failed')(error);

    expect(consoleError).toHaveBeenCalledWith('Seed failed:');
    expect(consoleError).toHaveBeenCalledWith(error);
    expect(exit).toHaveBeenCalledWith(1);
  });
});
