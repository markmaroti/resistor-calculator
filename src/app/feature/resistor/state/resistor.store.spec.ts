import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { Color, ReverseMode } from '@resistor/resistor.model';
import { ResistorService } from '@resistor/services/resistor.service';

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

    expect(store.reverseForm().value()).toEqual({
      targetInput: '1k',
      bandCount: 4,
      tolerancePct: null,
      tcrPpm: null,
      mode: ReverseMode.Exact,
    });
  });

  it('exposes reverse validation message for invalid input', () => {
    const store = createStore();
    store.reverseForm().value.update((current) => ({ ...current, targetInput: '' }));

    expect(store.reverseValidationMessage()).toBe('Resistance value is required.');
  });

  it('computes reverse view model from valid input', () => {
    const store = createStore();
    store.reverseForm().value.update((current) => ({
      ...current,
      targetInput: '1k',
      bandCount: 4,
      mode: ReverseMode.Exact,
    }));

    const vm = store.reverseViewModel();

    expect(vm.targetOhms).toBe(1_000);
    expect(vm.isValidTarget).toBe(true);
    expect(vm.candidates.length).toBeGreaterThan(0);
  });

  it('ignores tcr input for 4-band reverse state', () => {
    const store = createStore();
    store.reverseForm().value.update((current) => ({
      ...current,
      targetInput: '1k',
      bandCount: 4,
      tcrPpm: 5,
      mode: ReverseMode.Exact,
    }));

    const vm = store.reverseViewModel();

    expect(store.reverseValidationMessage()).toBe('');
    expect(vm.candidates.length).toBeGreaterThan(0);
    expect(vm.candidates.every((candidate) => candidate.tcrPpm === null)).toBe(true);
  });

  it('applies selected reverse candidate into forward form and updates result', () => {
    const store = createStore();
    store.reverseForm().value.update((current) => ({
      ...current,
      targetInput: '2.2k',
      bandCount: 4,
      mode: ReverseMode.Exact,
    }));

    const candidate = store.reverseViewModel().candidates[0];
    expect(candidate).toBeDefined();
    if (!candidate) {
      throw new Error('Expected at least one reverse candidate');
    }

    store.applyCandidate(candidate);

    expect(store.form().value()).toEqual(candidate.bands);
    expect(store.viewModel().ohms).toBe(candidate.ohms);
  });

  it('hydrates forward and reverse forms from url state', () => {
    const store = createStore();

    store.hydrateFromUrlState({
      forward: {
        bandCount: '6',
        digit1: 'Red',
        digit2: 'Violet',
        digit3: 'Black',
        multiplier: 'Orange',
        tolerance: 'Brown',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: '2.2k',
        bandCount: '6',
        tolerancePct: '1',
        tcrPpm: '25',
        mode: ReverseMode.Nearest,
      },
    });

    expect(store.form().value()).toEqual({
      bandCount: 6,
      digit1: Color.Red,
      digit2: Color.Violet,
      digit3: Color.Black,
      multiplier: Color.Orange,
      tolerance: Color.Brown,
      tcr: Color.Blue,
    });
    expect(store.reverseForm().value()).toEqual({
      targetInput: '2.2k',
      bandCount: 6,
      tolerancePct: 1,
      tcrPpm: 25,
      mode: ReverseMode.Nearest,
    });
  });

  it('ignores invalid url state values during hydration', () => {
    const store = createStore();

    store.hydrateFromUrlState({
      forward: {
        bandCount: '4',
        digit1: 'Pink' as Color,
      },
      reverse: {
        targetInput: '   ',
        tolerancePct: '0',
        mode: 'INVALID' as ReverseMode,
      },
    });

    expect(store.form().value()).toEqual({
      bandCount: 4,
      digit1: Color.Brown,
      digit2: Color.Black,
      digit3: Color.Black,
      multiplier: Color.Black,
      tolerance: Color.Gold,
      tcr: Color.Brown,
    });
    expect(store.reverseForm().value()).toEqual({
      targetInput: '1k',
      bandCount: 4,
      tolerancePct: null,
      tcrPpm: null,
      mode: ReverseMode.Exact,
    });
  });

  it('preserves defaults for fields missing from partial url hydration', () => {
    const store = createStore();

    store.hydrateFromUrlState({
      forward: {
        multiplier: Color.Red,
      },
    });

    expect(store.form().value()).toEqual({
      bandCount: 4,
      digit1: Color.Brown,
      digit2: Color.Black,
      digit3: Color.Black,
      multiplier: Color.Red,
      tolerance: Color.Gold,
      tcr: Color.Brown,
    });
    expect(store.reverseForm().value()).toEqual({
      targetInput: '1k',
      bandCount: 4,
      tolerancePct: null,
      tcrPpm: null,
      mode: ReverseMode.Exact,
    });
  });

  it('keeps stable 4-band state when hydration contains digit3 and tcr values', () => {
    const store = createStore();

    store.hydrateFromUrlState({
      forward: {
        bandCount: '4',
        digit1: Color.Brown,
        digit2: Color.Black,
        digit3: Color.Red,
        multiplier: Color.Black,
        tolerance: Color.Gold,
        tcr: Color.Blue,
      },
    });

    expect(store.form().value()).toEqual({
      bandCount: 4,
      digit1: Color.Brown,
      digit2: Color.Black,
      digit3: Color.Red,
      multiplier: Color.Black,
      tolerance: Color.Gold,
      tcr: Color.Blue,
    });
    expect(store.validationMessage()).toBe('');
    expect(store.viewModel().showDigit3).toBe(false);
    expect(store.viewModel().showTcr).toBe(false);
    expect(store.viewModel().ohms).toBe(10);
  });

  it('memoizes forward view model between unchanged reads', () => {
    const store = createStore();
    const service = TestBed.inject(ResistorService);
    const calculateResistanceSpy = vi.spyOn(service, 'calculateResistance');

    const first = store.viewModel();
    const second = store.viewModel();

    expect(first).toBe(second);
    expect(calculateResistanceSpy).toHaveBeenCalledTimes(1);

    store.form().value.update((current) => ({ ...current, digit1: Color.Red }));

    const third = store.viewModel();

    expect(third).not.toBe(first);
    expect(calculateResistanceSpy).toHaveBeenCalledTimes(2);
  });

  it('memoizes reverse view model and skips service call for invalid parse input', () => {
    const store = createStore();
    const service = TestBed.inject(ResistorService);
    const calculateReverseSpy = vi.spyOn(service, 'calculateBandsFromResistance');

    store.reverseForm().value.update((current) => ({
      ...current,
      targetInput: '1k',
      bandCount: 4,
      mode: ReverseMode.Exact,
    }));

    const first = store.reverseViewModel();
    const second = store.reverseViewModel();

    expect(first).toBe(second);
    expect(calculateReverseSpy).toHaveBeenCalledTimes(1);

    store.reverseForm().value.update((current) => ({ ...current, targetInput: '' }));

    const invalid = store.reverseViewModel();

    expect(invalid.parseErrorCode).toBeTruthy();
    expect(calculateReverseSpy).toHaveBeenCalledTimes(1);
  });
});
