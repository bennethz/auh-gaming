/**
 * Joins class names into one string, skipping falsy values.
 * @param classNames - Class name strings or conditional values.
 * @returns The combined class string.
 */
export function cn(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
