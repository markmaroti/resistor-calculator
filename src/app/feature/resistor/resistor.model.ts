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
