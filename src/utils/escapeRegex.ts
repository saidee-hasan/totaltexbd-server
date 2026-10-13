/**
 * Escapes user-supplied text before it is embedded in a RegExp so search input
 * cannot inject regex operators (which could otherwise cause ReDoS or match
 * unintended records).
 */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
