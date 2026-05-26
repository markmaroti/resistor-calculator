import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { ResistorService } from '../services/resistor.service';
import { toResistorInput, toViewModel } from './resistor.mappers';
import { getResistanceValidationMessage } from './validation-messages';
import { resistorBandsValidator } from './resistor.validators';
import { Color, DEFAULT_BAND_COUNT, ResistorBandsInput, type BandCount } from '../resistor.model';

@Injectable()
export class ResistorStore {
  private readonly service = inject(ResistorService);

  private readonly defaultBandsInput: ResistorBandsInput = {
    bandCount: DEFAULT_BAND_COUNT,
    digit1: Color.Brown,
    digit2: Color.Black,
    digit3: Color.Black,
    multiplier: Color.Black,
    tolerance: Color.Gold,
    tcr: Color.Brown,
  };

  private readonly formGroup = new FormGroup(
    {
      bandCount: new FormControl<BandCount>(this.defaultBandsInput.bandCount, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      digit1: new FormControl<Color>(this.defaultBandsInput.digit1, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      digit2: new FormControl<Color>(this.defaultBandsInput.digit2, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      digit3: new FormControl<Color>(this.defaultBandsInput.digit3, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      multiplier: new FormControl<Color>(this.defaultBandsInput.multiplier, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tolerance: new FormControl<Color>(this.defaultBandsInput.tolerance, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tcr: new FormControl<Color>(this.defaultBandsInput.tcr, {
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
    this.form.valueChanges.pipe(
      map(() => toResistorInput(this.form.getRawValue() as ResistorBandsInput)),
    ),
    { initialValue: toResistorInput(this.form.getRawValue() as ResistorBandsInput) },
  );

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  public readonly viewModel = computed(() => {
    const input = toResistorInput(this.formValue());
    const resistanceResult = this.service.calculateResistance(input);

    return toViewModel(input, resistanceResult);
  });

  public readonly validationMessage = computed(() => {
    this.formStatus();
    const calculationError = this.viewModel().calculationError;
    if (!calculationError) {
      return '';
    }

    return getResistanceValidationMessage(calculationError.code);
  });

  public readonly isAtDefaults = computed(() => {
    const value = this.formValue();

    return (
      value.bandCount === this.defaultBandsInput.bandCount &&
      value.digit1 === this.defaultBandsInput.digit1 &&
      value.digit2 === this.defaultBandsInput.digit2 &&
      value.digit3 === this.defaultBandsInput.digit3 &&
      value.multiplier === this.defaultBandsInput.multiplier &&
      value.tolerance === this.defaultBandsInput.tolerance &&
      value.tcr === this.defaultBandsInput.tcr
    );
  });

  public resetToDefaults(): void {
    this.form.reset(this.defaultBandsInput);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
