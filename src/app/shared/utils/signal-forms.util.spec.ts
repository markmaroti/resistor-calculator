import { FieldTree } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { firstFieldErrorMessageInPriorityOrder, toValidationError } from './signal-forms.util';

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

describe('firstFieldErrorMessageInPriorityOrder', () => {
  function fakeField(messages: string[]): FieldTree<string> {
    const state = { errors: () => messages.map((message) => ({ kind: 'fake', message })) };
    return (() => state) as unknown as FieldTree<string>;
  }

  it('returns an empty string when no field has an error', () => {
    expect(firstFieldErrorMessageInPriorityOrder([fakeField([]), fakeField([])])).toBe('');
  });

  it('skips fields without errors and returns the first one that has an error', () => {
    const noError = fakeField([]);
    const hasError = fakeField(['second field message']);
    const alsoHasError = fakeField(['third field message']);

    expect(firstFieldErrorMessageInPriorityOrder([noError, hasError, alsoHasError])).toBe(
      'second field message',
    );
  });

  it('prioritizes an earlier field even when a later field is also invalid', () => {
    const higherPriority = fakeField(['first field message']);
    const lowerPriority = fakeField(['second field message']);

    expect(firstFieldErrorMessageInPriorityOrder([higherPriority, lowerPriority])).toBe(
      'first field message',
    );
  });
});
