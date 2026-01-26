export const Color = {
  Black: 'Black',
  Brown: 'Brown',
  Red: 'Red',
  Orange: 'Orange',
  Yellow: 'Yellow',
  Green: 'Green',
  Blue: 'Blue',
  Violet: 'Violet',
  Gray: 'Gray',
  White: 'White',
  Gold: 'Gold',
  Silver: 'Silver',
} as const;

export type Color = (typeof Color)[keyof typeof Color];

export const DIGIT_BY_COLOR: Record<Color, number | null> = {
  [Color.Black]: 0,
  [Color.Brown]: 1,
  [Color.Red]: 2,
  [Color.Orange]: 3,
  [Color.Yellow]: 4,
  [Color.Green]: 5,
  [Color.Blue]: 6,
  [Color.Violet]: 7,
  [Color.Gray]: 8,
  [Color.White]: 9,
  [Color.Gold]: null,
  [Color.Silver]: null,
};

export const MULTIPLIER_BY_COLOR: Record<Color, number> = {
  [Color.Black]: 1,
  [Color.Brown]: 10,
  [Color.Red]: 100,
  [Color.Orange]: 1_000,
  [Color.Yellow]: 10_000,
  [Color.Green]: 100_000,
  [Color.Blue]: 1_000_000,
  [Color.Violet]: 10_000_000,
  [Color.Gray]: 100_000_000,
  [Color.White]: 1_000_000_000,
  [Color.Gold]: 0.1,
  [Color.Silver]: 0.01,
};

export const TOLERANCE_BY_COLOR: Partial<Record<Color, number>> = {
  [Color.Brown]: 1,
  [Color.Red]: 2,
  [Color.Green]: 0.5,
  [Color.Blue]: 0.25,
  [Color.Violet]: 0.1,
  [Color.Gray]: 0.05,
  [Color.Gold]: 5,
  [Color.Silver]: 10,
};

export const TCR_BY_COLOR: Partial<Record<Color, number>> = {
  [Color.Brown]: 100,
  [Color.Red]: 50,
  [Color.Orange]: 15,
  [Color.Yellow]: 25,
  [Color.Blue]: 10,
  [Color.Violet]: 5,
};

export const COLOR_HEX: Record<Color, string> = {
  [Color.Black]: '#1f1f1f',
  [Color.Brown]: '#7a4b2a',
  [Color.Red]: '#c43b2f',
  [Color.Orange]: '#d9791f',
  [Color.Yellow]: '#e2c233',
  [Color.Green]: '#2f7f4f',
  [Color.Blue]: '#2f5fa8',
  [Color.Violet]: '#6d4aa8',
  [Color.Gray]: '#8a8f98',
  [Color.White]: '#f1f1f1',
  [Color.Gold]: '#c7a24b',
  [Color.Silver]: '#b7bcc4',
};

export const BAND_COUNTS = [4, 5, 6] as const;
export type BandCount = (typeof BAND_COUNTS)[number];

export type BandColorKey = 'digit1' | 'digit2' | 'digit3' | 'multiplier' | 'tolerance' | 'tcr';

export const BAND_LAYOUTS: Record<BandCount, { xs: number[]; width: number }> = {
  4: { xs: [200, 250, 330, 425], width: 28 },
  5: { xs: [190, 230, 270, 340, 430], width: 26 },
  6: { xs: [185, 220, 255, 305, 360, 430], width: 24 },
};

export const BAND_COLOR_KEYS: Record<BandCount, readonly BandColorKey[]> = {
  4: ['digit1', 'digit2', 'multiplier', 'tolerance'],
  5: ['digit1', 'digit2', 'digit3', 'multiplier', 'tolerance'],
  6: ['digit1', 'digit2', 'digit3', 'multiplier', 'tolerance', 'tcr'],
};

export function buildBandColors(count: BandCount, colors: Record<BandColorKey, Color>): Color[] {
  return BAND_COLOR_KEYS[count].map((key) => colors[key]);
}
