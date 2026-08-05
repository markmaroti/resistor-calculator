import { httpResource } from '@angular/common/http';
import { Service } from '@angular/core';

import { Color } from '@resistor/resistor.model';

export type ResistorReference = {
  eSeries: { name: string; values: number[] }[];
  tolerances: { color: Color; pct: number }[];
  tcr: { color: Color; ppm: number }[];
};

const LOADING_DEFAULT: ResistorReference = {
  eSeries: [],
  tolerances: [],
  tcr: [],
};

@Service()
export class ResistorReferenceService {
  public readonly reference = httpResource<ResistorReference>(() => '/resistor-reference.json', {
    defaultValue: LOADING_DEFAULT,
  });
}
