import { Injectable, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { ResistorService } from '../services/resistor.service';
import {
  BandCount,
  Color,
  DEFAULT_BAND_COUNT,
  DIGIT_BY_COLOR,
  ResistorBandsInput,
} from '../resistor.model';

@Injectable()
export class ResistorStore {
  private readonly formGroup = new FormGroup(
    {
      bandCount: new FormControl<BandCount>(DEFAULT_BAND_COUNT, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      digit1: new FormControl<Color>(Color.Brown, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      digit2: new FormControl<Color>(Color.Black, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      digit3: new FormControl<Color>(Color.Black, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      multiplier: new FormControl<Color>(Color.Black, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tolerance: new FormControl<Color>(Color.Gold, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tcr: new FormControl<Color>(Color.Brown, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [
        (control) => {
          const value = control.value as ResistorBandsInput;
          const digit1 = DIGIT_BY_COLOR[value.digit1];
          const digit2 = DIGIT_BY_COLOR[value.digit2];
          const digit3 = DIGIT_BY_COLOR[value.digit3];

          if (digit1 === null || digit2 === null) {
            return { invalidDigits: true };
          }

          if (value.bandCount !== 4 && digit3 === null) {
            return { invalidDigit3: true };
          }

          return null;
        },
      ],
    },
  );

  public readonly form = this.formGroup;

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue() as ResistorBandsInput)),
    { initialValue: this.form.getRawValue() as ResistorBandsInput },
  );

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  public readonly viewModel = computed(() => {
    const value = this.formValue();
    const resistance = this.service.calculateResistanceFromBands(value);
    const bandCount = value.bandCount;

    return {
      bandCount: bandCount,
      digit1: value.digit1,
      digit2: value.digit2,
      digit3: value.digit3,
      multiplier: value.multiplier,
      tolerance: value.tolerance,
      tcr: value.tcr,
      ohms: resistance.ohms,
      tolerancePct: resistance.tolerancePct,
      tcrPpm: resistance.tcrPpm,
      showDigit3: bandCount !== 4,
      showTcr: bandCount === 6,
    };
  });

  public readonly validationMessage = computed(() => {
    this.formStatus();
    const errors = this.form.errors;
    if (errors?.['invalidDigits']) {
      return 'Digit bands must be a valid color (not Gold/Silver).';
    }
    if (errors?.['invalidDigit3']) {
      return 'Band 3 must be a valid digit color for 5- and 6-band resistors.';
    }
    return '';
  });

  constructor(private readonly service: ResistorService) {}
}
