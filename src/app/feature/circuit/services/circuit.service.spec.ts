import { describe, it, expect } from 'vitest';
import { CircuitService } from './circuit.service';

describe('CircuitService', () => {
  let service: CircuitService;

  beforeEach(() => {
    service = new CircuitService();
  });

  describe('calculateSeries', () => {
    it('sums two resistors correctly', () => {
      const result = service.calculateSeries({ resistors: [330, 470] });

      expect(result.error).toBeNull();
      expect(result.data.totalOhms).toBe(800);
    });

    it('sums three resistors correctly', () => {
      const result = service.calculateSeries({ resistors: [100, 220, 330] });

      expect(result.error).toBeNull();
      expect(result.data.totalOhms).toBe(650);
    });

    it('returns the same value for a single resistor', () => {
      const result = service.calculateSeries({ resistors: [1000] });

      expect(result.error).toBeNull();
      expect(result.data.totalOhms).toBe(1000);
    });

    it('returns EmptyInput error for empty array', () => {
      const result = service.calculateSeries({ resistors: [] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('EMPTY_INPUT');
    });

    it('returns InvalidResistor error for zero', () => {
      const result = service.calculateSeries({ resistors: [330, 0] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for negative value', () => {
      const result = service.calculateSeries({ resistors: [-100] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for NaN', () => {
      const result = service.calculateSeries({ resistors: [NaN] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for Infinity', () => {
      const result = service.calculateSeries({ resistors: [Infinity] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });
  });

  describe('calculateParallel', () => {
    it('calculates two equal resistors correctly', () => {
      const result = service.calculateParallel({ resistors: [100, 100] });

      expect(result.error).toBeNull();
      expect(result.data.totalOhms).toBeCloseTo(50, 6);
    });

    it('calculates two different resistors correctly', () => {
      const result = service.calculateParallel({ resistors: [300, 600] });

      expect(result.error).toBeNull();
      expect(result.data.totalOhms).toBe(200);
    });

    it('returns the same value for a single resistor', () => {
      const result = service.calculateParallel({ resistors: [1000] });

      expect(result.error).toBeNull();
      expect(result.data.totalOhms).toBe(1000);
    });

    it('returns EmptyInput error for empty array', () => {
      const result = service.calculateParallel({ resistors: [] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('EMPTY_INPUT');
    });

    it('returns InvalidResistor error for zero', () => {
      const result = service.calculateParallel({ resistors: [100, 0] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for NaN', () => {
      const result = service.calculateParallel({ resistors: [NaN] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for Infinity', () => {
      const result = service.calculateParallel({ resistors: [Infinity] });

      expect(result.data.totalOhms).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });
  });

  describe('calculateDivider', () => {
    it('calculates Vout and current for equal R1 and R2', () => {
      const result = service.calculateDivider({ vin: 5, r1: 1000, r2: 1000 });

      expect(result.error).toBeNull();
      expect(result.data.vout).toBeCloseTo(2.5, 6);
      expect(result.data.current).toBeCloseTo(0.0025, 6);
    });

    it('calculates correct Vout for unequal R1 and R2', () => {
      const result = service.calculateDivider({ vin: 12, r1: 1000, r2: 2000 });

      expect(result.error).toBeNull();
      expect(result.data.vout).toBeCloseTo(8, 6);
      expect(result.data.current).toBeCloseTo(0.004, 6);
    });

    it('returns InvalidResistor error for zero Vin', () => {
      const result = service.calculateDivider({ vin: 0, r1: 1000, r2: 1000 });

      expect(result.data.vout).toBe(0);
      expect(result.data.current).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for zero R1', () => {
      const result = service.calculateDivider({ vin: 5, r1: 0, r2: 1000 });

      expect(result.data.vout).toBe(0);
      expect(result.data.current).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for zero R2', () => {
      const result = service.calculateDivider({ vin: 5, r1: 1000, r2: 0 });

      expect(result.data.vout).toBe(0);
      expect(result.data.current).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for NaN', () => {
      const result = service.calculateDivider({ vin: NaN, r1: 1000, r2: 1000 });

      expect(result.data.vout).toBe(0);
      expect(result.data.current).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });

    it('returns InvalidResistor error for Infinity', () => {
      const result = service.calculateDivider({ vin: 5, r1: Infinity, r2: 1000 });

      expect(result.data.vout).toBe(0);
      expect(result.data.current).toBe(0);
      expect(result.error).not.toBeNull();
      expect(result.error!.code).toBe('INVALID_RESISTOR');
    });
  });
});
