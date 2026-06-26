import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';

import { ResistanceValueErrorCode } from '@shared/utils/resistance-value.util';

import { CircuitService } from '@circuit/services/circuit.service';
import {
  CircuitValidationError,
  CircuitTab,
  DividerFormValue,
  ParallelFormValue,
  SeriesFormValue,
} from '@circuit/circuit.model';

import {
  toDividerInput,
  toDividerViewModel,
  toParallelInput,
  toParallelViewModel,
  toSeriesInput,
  toSeriesViewModel,
} from './circuit.mappers';
import { circuitNumberValidator, circuitResistorValidator } from './circuit.validators';
import {
  getCircuitResistorValidationMessage,
  getCircuitValidationMessage,
} from './validation-messages';

@Injectable()
export class CircuitStore {
  private readonly service = inject(CircuitService);

  public readonly activeTab = signal<CircuitTab>('series');

  public readonly seriesForm = new FormGroup({
    resistors: new FormArray<FormControl<string>>(
      [this.createResistorControl(), this.createResistorControl()],
      { validators: [Validators.required] },
    ),
  });

  public readonly parallelForm = new FormGroup({
    resistors: new FormArray<FormControl<string>>(
      [this.createResistorControl(), this.createResistorControl()],
      { validators: [Validators.required] },
    ),
  });

  public readonly dividerForm = new FormGroup({
    vin: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, circuitNumberValidator],
    }),
    r1: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, circuitResistorValidator],
    }),
    r2: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, circuitResistorValidator],
    }),
  });

  private readonly seriesFormValue = toSignal(
    this.seriesForm.valueChanges.pipe(map(() => this.seriesForm.getRawValue() as SeriesFormValue)),
    { initialValue: this.seriesForm.getRawValue() as SeriesFormValue },
  );

  private readonly parallelFormValue = toSignal(
    this.parallelForm.valueChanges.pipe(
      map(() => this.parallelForm.getRawValue() as ParallelFormValue),
    ),
    { initialValue: this.parallelForm.getRawValue() as ParallelFormValue },
  );

  private readonly dividerFormValue = toSignal(
    this.dividerForm.valueChanges.pipe(
      map(() => this.dividerForm.getRawValue() as DividerFormValue),
    ),
    { initialValue: this.dividerForm.getRawValue() as DividerFormValue },
  );

  private readonly seriesFormStatus = toSignal(this.seriesForm.statusChanges, {
    initialValue: this.seriesForm.status,
  });

  private readonly parallelFormStatus = toSignal(this.parallelForm.statusChanges, {
    initialValue: this.parallelForm.status,
  });

  private readonly dividerFormStatus = toSignal(this.dividerForm.statusChanges, {
    initialValue: this.dividerForm.status,
  });

  public readonly seriesViewModel = computed(() => {
    const value = this.seriesFormValue();
    const input = toSeriesInput(value);
    const result = this.service.calculateSeries(input);
    return toSeriesViewModel(value, result);
  });

  public readonly parallelViewModel = computed(() => {
    const value = this.parallelFormValue();
    const input = toParallelInput(value);
    const result = this.service.calculateParallel(input);
    return toParallelViewModel(value, result);
  });

  public readonly dividerViewModel = computed(() => {
    const value = this.dividerFormValue();
    const input = toDividerInput(value);
    const result = this.service.calculateDivider(input);
    return toDividerViewModel(value, result);
  });

  public readonly seriesValidationMessage = computed(() => {
    this.seriesFormStatus();
    this.seriesFormValue();
    const formMessage = this.getResistorFormValidationMessage(this.seriesForm.controls.resistors);
    if (formMessage) {
      return formMessage;
    }

    const error = this.seriesViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  public readonly parallelValidationMessage = computed(() => {
    this.parallelFormStatus();
    this.parallelFormValue();
    const formMessage = this.getResistorFormValidationMessage(this.parallelForm.controls.resistors);
    if (formMessage) {
      return formMessage;
    }

    const error = this.parallelViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  public readonly dividerValidationMessage = computed(() => {
    this.dividerFormStatus();
    this.dividerFormValue();
    const vinMessage = this.getNumberValidationMessage(this.dividerForm.controls.vin);
    if (vinMessage) {
      return vinMessage;
    }

    const r1Message = this.getResistorValidationMessage(this.dividerForm.controls.r1);
    if (r1Message) {
      return r1Message;
    }

    const r2Message = this.getResistorValidationMessage(this.dividerForm.controls.r2);
    if (r2Message) {
      return r2Message;
    }

    const error = this.dividerViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  public setActiveTab(tab: CircuitTab): void {
    this.activeTab.set(tab);
  }

  public addResistor(form: 'series' | 'parallel'): void {
    const formGroup = form === 'series' ? this.seriesForm : this.parallelForm;
    formGroup.controls.resistors.push(this.createResistorControl());
  }

  public removeResistor(form: 'series' | 'parallel', index: number): void {
    const formGroup = form === 'series' ? this.seriesForm : this.parallelForm;
    if (formGroup.controls.resistors.length > 1) {
      formGroup.controls.resistors.removeAt(index);
    }
  }

  public resetForm(tab: CircuitTab): void {
    switch (tab) {
      case 'series':
        this.resetResistorFormArray(this.seriesForm.controls.resistors);
        this.seriesForm.markAsPristine();
        this.seriesForm.markAsUntouched();
        break;
      case 'parallel':
        this.resetResistorFormArray(this.parallelForm.controls.resistors);
        this.parallelForm.markAsPristine();
        this.parallelForm.markAsUntouched();
        break;
      case 'divider':
        this.dividerForm.reset();
        this.dividerForm.markAsPristine();
        this.dividerForm.markAsUntouched();
        break;
    }
  }

  private createResistorControl(value = ''): FormControl<string> {
    return new FormControl<string>(value, {
      nonNullable: true,
      validators: [Validators.required, circuitResistorValidator],
    });
  }

  private resetResistorFormArray(formArray: FormArray<FormControl<string>>, count = 2): void {
    formArray.clear();
    for (let i = 0; i < count; i++) {
      formArray.push(this.createResistorControl());
    }
  }

  private getResistorFormValidationMessage(formArray: FormArray<FormControl<string>>): string {
    for (const control of formArray.controls) {
      const message = this.getResistorValidationMessage(control);
      if (message) {
        return message;
      }
    }

    return '';
  }

  private getResistorValidationMessage(control: FormControl<string>): string {
    const errors = control.errors as {
      required?: boolean;
      circuitResistor?: ResistanceValueErrorCode;
    } | null;

    if (!errors) {
      return '';
    }

    if (errors.required) {
      return getCircuitValidationMessage(CircuitValidationError.EmptyInput);
    }

    if (errors.circuitResistor) {
      return getCircuitResistorValidationMessage(errors.circuitResistor);
    }

    return '';
  }

  private getNumberValidationMessage(control: FormControl<string>): string {
    const errors = control.errors as {
      required?: boolean;
      circuitNumber?: CircuitValidationError;
    } | null;

    if (!errors) {
      return '';
    }

    if (errors.required) {
      return getCircuitValidationMessage(CircuitValidationError.EmptyInput);
    }

    if (errors.circuitNumber) {
      return getCircuitValidationMessage(errors.circuitNumber);
    }

    return '';
  }
}
