import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ReverseMode } from '../resistor.model';
import { ResistorStore } from './resistor.store';

describe('ResistorStore', () => {
  function createStore(): ResistorStore {
    TestBed.configureTestingModule({
      providers: [ResistorStore],
    });

    return TestBed.inject(ResistorStore);
  }

  it('initializes reverse form with expected defaults', () => {
    const store = createStore();

    expect(store.reverseForm.getRawValue()).toEqual({
      targetInput: '1k',
      bandCount: 4,
      tolerancePct: null,
      tcrPpm: null,
      mode: ReverseMode.Exact,
    });
  });

  it('exposes reverse validation message for invalid input', () => {
    const store = createStore();
    store.reverseForm.patchValue({ targetInput: '' });

    expect(store.reverseValidationMessage()).toBe('Resistance value is required.');
  });

  it('computes reverse view model from valid input', () => {
    const store = createStore();
    store.reverseForm.patchValue({
      targetInput: '1k',
      bandCount: 4,
      mode: ReverseMode.Exact,
    });

    const vm = store.reverseViewModel();

    expect(vm.targetOhms).toBe(1_000);
    expect(vm.isValidTarget).toBe(true);
    expect(vm.candidates.length).toBeGreaterThan(0);
  });

  it('ignores tcr input for 4-band reverse state', () => {
    const store = createStore();
    store.reverseForm.patchValue({
      targetInput: '1k',
      bandCount: 4,
      tcrPpm: 5,
      mode: ReverseMode.Exact,
    });

    const vm = store.reverseViewModel();

    expect(store.reverseValidationMessage()).toBe('');
    expect(vm.candidates.length).toBeGreaterThan(0);
    expect(vm.candidates.every((candidate) => candidate.tcrPpm === null)).toBe(true);
  });

  it('applies selected reverse candidate into forward form and updates result', () => {
    const store = createStore();
    store.reverseForm.patchValue({
      targetInput: '2.2k',
      bandCount: 4,
      mode: ReverseMode.Exact,
    });

    const candidate = store.reverseViewModel().candidates[0];
    expect(candidate).toBeDefined();
    if (!candidate) {
      throw new Error('Expected at least one reverse candidate');
    }

    store.applyCandidate(candidate);

    expect(store.form.getRawValue()).toEqual(candidate.bands);
    expect(store.viewModel().ohms).toBe(candidate.ohms);
  });
});
