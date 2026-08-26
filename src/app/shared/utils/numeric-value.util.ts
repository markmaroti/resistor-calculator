const NON_DECIMAL_NUMERIC_LITERAL = /^0[bBoOxX]/;

/** Parses a plain decimal number, rejecting hex/octal/binary literals (`0x10`, `0b101`, `0o17`) that `Number()` would otherwise silently evaluate. */
export function parseStrictNumber(value: string): number {
  return NON_DECIMAL_NUMERIC_LITERAL.test(value.trim()) ? NaN : Number(value);
}
