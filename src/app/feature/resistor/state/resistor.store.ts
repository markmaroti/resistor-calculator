import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { ResistorService } from '../services/resistor.service';
import { resistorBandsValidator } from './resistor.validators';
import {
  BandCount,
  Color,
  DEFAULT_BAND_COUNT,
  ResistanceErrorCode,
  ResistorBandsInput,
} from '../resistor.model';

@Injectable()
export class ResistorStore {
  private readonly service = inject(ResistorService);

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
      validators: [resistorBandsValidator],
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
    const resistanceResult = this.service.calculateResistance(value);
    const bandCount = value.bandCount;

    return {
      bandCount: bandCount,
      digit1: value.digit1,
      digit2: value.digit2,
      digit3: value.digit3,
      multiplier: value.multiplier,
      tolerance: value.tolerance,
      tcr: value.tcr,
      ohms: resistanceResult.data.ohms,
      tolerancePct: resistanceResult.data.tolerancePct,
      tcrPpm: resistanceResult.data.tcrPpm,
      calculationError: resistanceResult.error,
      showDigit3: bandCount !== 4,
      showTcr: bandCount === 6,
    };
  });

  public readonly validationMessage = computed(() => {
    this.formStatus();
    const calculationError = this.viewModel().calculationError;
    if (!calculationError) {
      return '';
    }

    switch (calculationError.code) {
      case ResistanceErrorCode.InvalidDigitColor:
      case ResistanceErrorCode.InvalidThirdDigitColor:
        return calculationError.message;
      default:
        return '';
    }
  });
}
