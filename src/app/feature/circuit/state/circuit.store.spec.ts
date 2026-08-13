import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CircuitTab } from '@circuit/circuit.model';

import { CircuitStore } from './circuit.store';

describe('CircuitStore', () => {
  function createStore(): CircuitStore {
    TestBed.configureTestingModule({
      providers: [CircuitStore],
    });

    return TestBed.inject(CircuitStore);
  }

  it('initializes series and parallel forms with two empty resistor rows', () => {
    const store = createStore();

    expect(store.seriesForm().value()).toEqual({ resistors: ['', ''] });
    expect(store.parallelForm().value()).toEqual({ resistors: ['', ''] });
  });

  it('shows a required message before any resistor value is entered', () => {
    const store = createStore();

    expect(store.seriesValidationMessage()).toBe('Resistance value is required.');
    expect(store.parallelValidationMessage()).toBe('Resistance value is required.');
  });

  it('computes the series total once valid resistor values are provided', () => {
    const store = createStore();

    store.seriesForm().value.set({ resistors: ['1k', '2k'] });

    expect(store.seriesValidationMessage()).toBe('');
    expect(store.seriesViewModel().totalOhms).toBe(3_000);
  });

  it('adds and removes resistor rows, keeping at least one row', () => {
    const store = createStore();

    store.addResistor(CircuitTab.Series);
    expect(store.seriesForm().value().resistors.length).toBe(3);

    store.removeResistor(CircuitTab.Series, 2);
    expect(store.seriesForm().value().resistors.length).toBe(2);

    store.removeResistor(CircuitTab.Series, 0);
    expect(store.seriesForm().value().resistors.length).toBe(1);

    store.removeResistor(CircuitTab.Series, 0);
    expect(store.seriesForm().value().resistors.length).toBe(1);
  });

  it('reports a resistor-specific validation message for invalid entries', () => {
    const store = createStore();

    store.seriesForm().value.set({ resistors: ['4.7k', '10x'] });

    expect(store.seriesValidationMessage()).toBe('Unsupported unit. Use Ω, kΩ, MΩ, or GΩ.');
  });

  it('resets series form back to two empty rows and clears dirty state', () => {
    const store = createStore();

    store.seriesForm().value.set({ resistors: ['1k', '2k', '3k'] });
    store.resetForm(CircuitTab.Series);

    expect(store.seriesForm().value()).toEqual({ resistors: ['', ''] });
    expect(store.seriesForm().dirty()).toBe(false);
  });

  it('computes divider output once vin, r1 and r2 are valid', () => {
    const store = createStore();

    store.dividerForm().value.set({ vin: '5', r1: '1k', r2: '1k' });

    expect(store.dividerValidationMessage()).toBe('');
    expect(store.dividerViewModel().vout).toBeCloseTo(2.5);
  });

  it('prioritizes vin validation message over r1/r2', () => {
    const store = createStore();

    store.dividerForm().value.set({ vin: 'abc', r1: '10x', r2: '1k' });

    expect(store.dividerValidationMessage()).toBe('Enter a valid number.');
  });

  it('rejects an SI-suffixed vin value instead of silently truncating it', () => {
    const store = createStore();

    store.dividerForm().value.set({ vin: '4.7k', r1: '1k', r2: '1k' });

    expect(store.dividerValidationMessage()).toBe('Enter a valid number.');
    expect(store.dividerViewModel().vout).toBeNull();
  });

  it('resets divider form back to empty values', () => {
    const store = createStore();

    store.dividerForm().value.set({ vin: '5', r1: '1k', r2: '2k' });
    store.resetForm(CircuitTab.Divider);

    expect(store.dividerForm().value()).toEqual({ vin: '', r1: '', r2: '' });
    expect(store.dividerForm().dirty()).toBe(false);
  });
});
