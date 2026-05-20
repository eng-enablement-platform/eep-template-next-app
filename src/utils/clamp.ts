/**
 * Clamps a number to a closed interval `[minimum, maximum]`.
 *
 * Centralises the `Math.min(Math.max(...))` pattern so callers (e.g. scroll
 * positions, progress percentages, slider values) don't have to re-derive it
 * every time. Throws on inverted bounds rather than silently swapping them —
 * an inverted range is almost always a programmer error worth surfacing.
 *
 * @param value - the number to constrain
 * @param minimum - lower bound, inclusive
 * @param maximum - upper bound, inclusive
 * @returns `value` constrained to `[minimum, maximum]`
 * @throws RangeError if `minimum` is greater than `maximum`
 */
export const clamp = (
  value: number,
  minimum: number,
  maximum: number,
): number => {
  if (minimum > maximum) {
    throw new RangeError(
      `clamp: minimum (${minimum}) must be <= maximum (${maximum})`,
    );
  }
  return Math.min(Math.max(value, minimum), maximum);
};
