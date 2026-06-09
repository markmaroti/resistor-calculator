export const CircuitErrorCode = {
  EmptyInput: 'EMPTY_INPUT',
  InvalidResistor: 'INVALID_RESISTOR',
  DivisionByZero: 'DIVISION_BY_ZERO',
} as const;

export type CircuitErrorCode = (typeof CircuitErrorCode)[keyof typeof CircuitErrorCode];

export type CircuitServiceError<TCode extends string> = {
  code: TCode;
  message: string;
};

export type CircuitServiceResult<TData, TCode extends string> = {
  data: TData;
  error: CircuitServiceError<TCode> | null;
};

export type SeriesInput = {
  resistors: number[];
};

export type ParallelInput = {
  resistors: number[];
};

export type DividerInput = {
  vin: number;
  r1: number;
  r2: number;
};

export type SeriesData = {
  totalOhms: number;
};

export type ParallelData = {
  totalOhms: number;
};

export type DividerData = {
  vout: number;
  current: number;
};

export type SeriesResult = CircuitServiceResult<SeriesData, CircuitErrorCode>;
export type ParallelResult = CircuitServiceResult<ParallelData, CircuitErrorCode>;
export type DividerResult = CircuitServiceResult<DividerData, CircuitErrorCode>;

export type CircuitResult = SeriesResult | ParallelResult | DividerResult;

export const CircuitValidationError = {
  EmptyInput: 'EMPTY_INPUT',
  InvalidFormat: 'INVALID_FORMAT',
  NonPositiveValue: 'NON_POSITIVE_VALUE',
  NonFiniteValue: 'NON_FINITE_VALUE',
} as const;

export type CircuitValidationError =
  (typeof CircuitValidationError)[keyof typeof CircuitValidationError];

export type SeriesFormValue = {
  resistors: string[];
};

export type ParallelFormValue = {
  resistors: string[];
};

export type DividerFormValue = {
  vin: string;
  r1: string;
  r2: string;
};

export type CircuitTab = 'series' | 'parallel' | 'divider';
