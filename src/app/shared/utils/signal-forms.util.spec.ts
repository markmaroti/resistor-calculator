import { describe, expect, it } from 'vitest';

import { toValidationError } from './signal-forms.util';

describe('toValidationError', () => {
  const getMessage = (code: 'foo' | 'bar') => (code === 'foo' ? 'Foo message' : 'Bar message');

  it('returns null when the result is null', () => {
    expect(toValidationError(null, getMessage)).toBeNull();
  });

  it('maps a validator result to a ValidationError with a resolved message', () => {
    expect(toValidationError({ kind: 'myKind', code: 'foo' as const }, getMessage)).toEqual({
      kind: 'myKind',
      message: 'Foo message',
    });
  });
});
