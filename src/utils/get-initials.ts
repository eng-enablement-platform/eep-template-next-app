type InitialsSource = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

/**
 * Build up to two avatar initials for a user.
 *
 * Clerk users can sign up with just an email, so first and last name are both
 * optional. Falls back from name, to the email's first letter, to `?` so the
 * avatar is never empty.
 *
 * @param source - Whatever name and email details the user has.
 * @returns One or two uppercase letters, or `?` when nothing is usable.
 * @example
 * ```ts
 * getInitials({ firstName: 'Ada', lastName: 'Lovelace' }); // 'AL'
 * getInitials({ email: 'ada@example.com' }); // 'A'
 * ```
 */
export const getInitials = ({
  firstName,
  lastName,
  email,
}: InitialsSource): string => {
  const nameInitials = [firstName, lastName]
    .map((part) => part?.trim().charAt(0) ?? '')
    .join('');

  if (nameInitials) {
    return nameInitials.toUpperCase();
  }

  const emailInitial = email?.trim().charAt(0);
  return emailInitial ? emailInitial.toUpperCase() : '?';
};
