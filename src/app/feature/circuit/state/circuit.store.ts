import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { CircuitService } from '../services/circuit.service';
import { CircuitTab, DividerFormValue, ParallelFormValue, SeriesFormValue } from '../circuit.model';
import {
  toDividerInput,
  toDividerViewModel,
  toParallelInput,
  toParallelViewModel,
  toSeriesInput,
  toSeriesViewModel,
} from './circuit.mappers';
import { circuitResistorValidator } from './circuit.validators';
import { getCircuitValidationMessage } from './validation-messages';

@Injectable()
export class CircuitStore {
  private readonly service = inject(CircuitService);

  readonly activeTab = signal<CircuitTab>('series');

  private createResistorControl(value = ''): FormControl<string> {
    return new FormControl<string>(value, {
      nonNullable: true,
      validators: [Validators.required, circuitResistorValidator],
    });
  }

  readonly seriesForm = new FormGroup({
    resistors: new FormArray<FormControl<string>>(
      [this.createResistorControl(), this.createResistorControl()],
      { validators: [Validators.required] },
    ),
  });

  readonly parallelForm = new FormGroup({
    resistors: new FormArray<FormControl<string>>(
      [this.createResistorControl(), this.createResistorControl()],
      { validators: [Validators.required] },
    ),
  });

  readonly dividerForm = new FormGroup({
    vin: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, circuitResistorValidator],
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

  readonly seriesViewModel = computed(() => {
    const value = this.seriesFormValue();
    const input = toSeriesInput(value);
    const result = this.service.calculateSeries(input);
    return toSeriesViewModel(value, result);
  });

  readonly parallelViewModel = computed(() => {
    const value = this.parallelFormValue();
    const input = toParallelInput(value);
    const result = this.service.calculateParallel(input);
    return toParallelViewModel(value, result);
  });

  readonly dividerViewModel = computed(() => {
    const value = this.dividerFormValue();
    const input = toDividerInput(value);
    const result = this.service.calculateDivider(input);
    return toDividerViewModel(value, result);
  });

  readonly seriesValidationMessage = computed(() => {
    this.seriesFormStatus();
    const error = this.seriesViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  readonly parallelValidationMessage = computed(() => {
    this.parallelFormStatus();
    const error = this.parallelViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  readonly dividerValidationMessage = computed(() => {
    this.dividerFormStatus();
    const error = this.dividerViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  setActiveTab(tab: CircuitTab): void {
    this.activeTab.set(tab);
  }

  addResistor(form: 'series' | 'parallel'): void {
    const formGroup = form === 'series' ? this.seriesForm : this.parallelForm;
    formGroup.controls.resistors.push(this.createResistorControl());
  }

  removeResistor(form: 'series' | 'parallel', index: number): void {
    const formGroup = form === 'series' ? this.seriesForm : this.parallelForm;
    if (formGroup.controls.resistors.length > 1) {
      formGroup.controls.resistors.removeAt(index);
    }
  }

  resetForm(tab: CircuitTab): void {
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

  private resetResistorFormArray(formArray: FormArray<FormControl<string>>, count = 2): void {
    formArray.clear();
    for (let i = 0; i < count; i++) {
      formArray.push(this.createResistorControl());
    }
  }
}
