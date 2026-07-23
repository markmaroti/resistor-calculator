import { Injectable, computed, inject, signal } from '@angular/core';
import { FieldTree, apply, applyEach, form } from '@angular/forms/signals';

import { CircuitService } from '@circuit/services/circuit.service';
import {
  CircuitErrorCode,
  CircuitServiceError,
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
import { circuitNumberFieldSchema, resistorFieldSchema } from './circuit.validators';
import { getCircuitValidationMessage } from './validation-messages';

@Injectable()
export class CircuitStore {
  private readonly service = inject(CircuitService);

  public readonly activeTab = signal<CircuitTab>('series');

  private readonly seriesModel = signal<SeriesFormValue>({ resistors: ['', ''] });

  public readonly seriesForm = form(this.seriesModel, (path) => {
    applyEach(path.resistors, resistorFieldSchema);
  });

  private readonly parallelModel = signal<ParallelFormValue>({ resistors: ['', ''] });

  public readonly parallelForm = form(this.parallelModel, (path) => {
    applyEach(path.resistors, resistorFieldSchema);
  });

  private readonly dividerModel = signal<DividerFormValue>({ vin: '', r1: '', r2: '' });

  public readonly dividerForm = form(this.dividerModel, (path) => {
    apply(path.vin, circuitNumberFieldSchema);
    apply(path.r1, resistorFieldSchema);
    apply(path.r2, resistorFieldSchema);
  });

  public readonly seriesViewModel = computed(() => {
    const value = this.seriesForm().value();
    const input = toSeriesInput(value);
    const result = this.service.calculateSeries(input);
    return toSeriesViewModel(value, result);
  });

  public readonly parallelViewModel = computed(() => {
    const value = this.parallelForm().value();
    const input = toParallelInput(value);
    const result = this.service.calculateParallel(input);
    return toParallelViewModel(value, result);
  });

  public readonly dividerViewModel = computed(() => {
    const value = this.dividerForm().value();
    const input = toDividerInput(value);
    const result = this.service.calculateDivider(input);
    return toDividerViewModel(value, result);
  });

  public readonly seriesValidationMessage = computed(() =>
    this.resistorListValidationMessage(this.seriesForm.resistors, this.seriesViewModel().error),
  );

  public readonly parallelValidationMessage = computed(() =>
    this.resistorListValidationMessage(this.parallelForm.resistors, this.parallelViewModel().error),
  );

  public readonly dividerValidationMessage = computed(() => {
    const vinMessage = this.getFieldMessage(this.dividerForm.vin);
    if (vinMessage) {
      return vinMessage;
    }

    const r1Message = this.getFieldMessage(this.dividerForm.r1);
    if (r1Message) {
      return r1Message;
    }

    const r2Message = this.getFieldMessage(this.dividerForm.r2);
    if (r2Message) {
      return r2Message;
    }

    const error = this.dividerViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  public setActiveTab(tab: CircuitTab): void {
    this.activeTab.set(tab);
  }

  public addResistor(formName: 'series' | 'parallel'): void {
    const model = formName === 'series' ? this.seriesModel : this.parallelModel;
    model.update((current) => ({ resistors: [...current.resistors, ''] }));
  }

  public removeResistor(formName: 'series' | 'parallel', index: number): void {
    const model = formName === 'series' ? this.seriesModel : this.parallelModel;
    model.update((current) =>
      current.resistors.length > 1
        ? { resistors: current.resistors.filter((_, i) => i !== index) }
        : current,
    );
  }

  public resetForm(tab: CircuitTab): void {
    switch (tab) {
      case 'series':
        this.seriesForm().reset({ resistors: ['', ''] });
        break;
      case 'parallel':
        this.parallelForm().reset({ resistors: ['', ''] });
        break;
      case 'divider':
        this.dividerForm().reset({ vin: '', r1: '', r2: '' });
        break;
    }
  }

  private resistorListValidationMessage(
    resistors: FieldTree<string[]>,
    error: CircuitServiceError<CircuitErrorCode> | null,
  ): string {
    const formMessage = this.getResistorFormValidationMessage(resistors);
    if (formMessage) {
      return formMessage;
    }

    return error ? getCircuitValidationMessage(error.code) : '';
  }

  private getResistorFormValidationMessage(resistors: FieldTree<string[]>): string {
    for (const item of resistors) {
      const message = this.getFieldMessage(item);
      if (message) {
        return message;
      }
    }

    return '';
  }

  private getFieldMessage(field: FieldTree<string>): string {
    return field().errors()[0]?.message ?? '';
  }
}
