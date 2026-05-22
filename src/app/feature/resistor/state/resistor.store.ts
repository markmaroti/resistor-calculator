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
}
