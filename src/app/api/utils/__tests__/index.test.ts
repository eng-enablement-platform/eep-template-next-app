import { NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  hasRole,
  parseId,
  validationErrorResponse,
  withAuth,
  withRole,
} from '@/app/api/utils';

/*
 * `auth()` from Clerk reads the request session. We mock it so the wrapper tests
 * can drive the three branches (signed out / wrong role / permitted) without a
 * real Clerk session. `mockAuth` is reassigned per test.
 */
const mockAuth = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

/*
 * The wrappers only read `request`/`context` to forward them, so a bare object
 * cast is enough - we never touch NextRequest internals in these tests.
 */
const fakeRequest = {} as Parameters<ReturnType<typeof withAuth>>[0];

describe('parseId', () => {
  it('returns the integer for a valid positive id', () => {
    expect(parseId('1')).toBe(1);
    expect(parseId('42')).toBe(42);
  });

  it('returns null for zero', () => {
    expect(parseId('0')).toBeNull();
  });

  it('returns null for a negative number', () => {
    expect(parseId('-1')).toBeNull();
  });

  it('returns null for a float', () => {
    expect(parseId('1.5')).toBeNull();
  });

  it('returns null for a non-numeric string', () => {
    expect(parseId('abc')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseId('')).toBeNull();
  });
});

describe('validationErrorResponse', () => {
  it('returns a 400 response', async () => {
    const result = z.object({ name: z.string() }).safeParse({ name: 123 });
    expect(result.success).toBe(false);
    if (result.success) return;

    const response = validationErrorResponse(result.error);
    expect(response.status).toBe(400);
  });

  it('includes fieldErrors in the response body', async () => {
    const result = z.object({ name: z.string() }).safeParse({ name: 123 });
    expect(result.success).toBe(false);
    if (result.success) return;

    const response = validationErrorResponse(result.error);
    const body = await response.json();

    expect(body.error).toBe('Validation failed');
    expect(body.fieldErrors).toHaveProperty('name');
  });
});

describe('hasRole', () => {
  it('grants a role its own exact level', () => {
    expect(hasRole('Admin', 'Admin')).toBe(true);
    expect(hasRole('SuperAdmin', 'SuperAdmin')).toBe(true);
  });

  it('treats SuperAdmin as a superset of Admin', () => {
    expect(hasRole('SuperAdmin', 'Admin')).toBe(true);
  });

  it('does not let Admin satisfy a SuperAdmin requirement', () => {
    expect(hasRole('Admin', 'SuperAdmin')).toBe(false);
  });

  it('rejects an undefined caller role', () => {
    expect(hasRole(undefined, 'Admin')).toBe(false);
    expect(hasRole(undefined, 'SuperAdmin')).toBe(false);
  });
});

describe('withAuth', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the caller is signed out', async () => {
    mockAuth.mockResolvedValue({ userId: null });
    const handler = vi.fn();

    const response = await withAuth(handler)(fakeRequest, undefined);

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('delegates to the handler with the auth context when signed in', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'Admin' } },
    });
    const handler = vi
      .fn()
      .mockReturnValue(NextResponse.json({ ok: true }, { status: 200 }));

    const response = await withAuth(handler)(fakeRequest, undefined);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(fakeRequest, undefined, {
      userId: 'user_123',
      role: 'Admin',
    });
  });
});

describe('withRole', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the caller is signed out', async () => {
    mockAuth.mockResolvedValue({ userId: null });
    const handler = vi.fn();

    const response = await withRole('SuperAdmin', handler)(
      fakeRequest,
      undefined,
    );

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 403 when the caller lacks the required role', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'Admin' } },
    });
    const handler = vi.fn();

    const response = await withRole('SuperAdmin', handler)(
      fakeRequest,
      undefined,
    );

    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('delegates when the caller meets the required role', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'SuperAdmin' } },
    });
    const handler = vi
      .fn()
      .mockReturnValue(NextResponse.json({ ok: true }, { status: 201 }));

    const response = await withRole('SuperAdmin', handler)(
      fakeRequest,
      undefined,
    );

    expect(response.status).toBe(201);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('lets a SuperAdmin satisfy an Admin requirement', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'SuperAdmin' } },
    });
    const handler = vi
      .fn()
      .mockReturnValue(NextResponse.json({ ok: true }, { status: 200 }));

    const response = await withRole('Admin', handler)(fakeRequest, undefined);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });
});
