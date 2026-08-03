export const URL_STATE_PARAM_KEY = {
  BandCount: 'bc',
  Digit1: 'd1',
  Digit2: 'd2',
  Digit3: 'd3',
  Multiplier: 'm',
  Tolerance: 't',
  Tcr: 'tc',
  Mode: 'mode',
  ReverseTargetInput: 'rti',
  ReverseBandCount: 'rbc',
  ReverseTolerancePct: 'rt',
  ReverseTcrPpm: 'rtc',
  ReverseMode: 'rm',
} as const;

export type UrlStateParamKey = (typeof URL_STATE_PARAM_KEY)[keyof typeof URL_STATE_PARAM_KEY];

export const URL_STATE_PARAM_ORDER: readonly UrlStateParamKey[] = [
  URL_STATE_PARAM_KEY.Mode,
  URL_STATE_PARAM_KEY.BandCount,
  URL_STATE_PARAM_KEY.Digit1,
  URL_STATE_PARAM_KEY.Digit2,
  URL_STATE_PARAM_KEY.Digit3,
  URL_STATE_PARAM_KEY.Multiplier,
  URL_STATE_PARAM_KEY.Tolerance,
  URL_STATE_PARAM_KEY.Tcr,
  URL_STATE_PARAM_KEY.ReverseTargetInput,
  URL_STATE_PARAM_KEY.ReverseBandCount,
  URL_STATE_PARAM_KEY.ReverseTolerancePct,
  URL_STATE_PARAM_KEY.ReverseTcrPpm,
  URL_STATE_PARAM_KEY.ReverseMode,
];

export const URL_CALCULATOR_MODE = {
  Forward: 'forward',
  Reverse: 'reverse',
} as const;

export type UrlCalculatorMode = (typeof URL_CALCULATOR_MODE)[keyof typeof URL_CALCULATOR_MODE];

export const URL_REVERSE_MODE = {
  Exact: 'EXACT',
  Nearest: 'NEAREST',
} as const;

export type UrlReverseMode = (typeof URL_REVERSE_MODE)[keyof typeof URL_REVERSE_MODE];

export type UrlBandCountValue = '4' | '5' | '6';

export type ResistorUrlQueryParamMap = Partial<Record<UrlStateParamKey, string>>;

export type ForwardUrlState = {
  bandCount?: UrlBandCountValue;
  digit1?: string;
  digit2?: string;
  digit3?: string;
  multiplier?: string;
  tolerance?: string;
  tcr?: string;
};

export type ReverseUrlState = {
  targetInput?: string;
  bandCount?: UrlBandCountValue;
  tolerancePct?: string;
  tcrPpm?: string;
  mode?: UrlReverseMode;
};

export type ResistorUrlState = {
  mode?: UrlCalculatorMode;
  forward?: ForwardUrlState;
  reverse?: ReverseUrlState;
};
