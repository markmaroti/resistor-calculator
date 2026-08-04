import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { FieldTree, apply, applyEach, form } from '@angular/forms/signals';

import { CircuitService } from '@circuit/services/circuit.service';
import {
  CircuitErrorCode,
  CircuitServiceError,
  CircuitTab,
  DividerFormValue,
  ResistorListFormValue,
  ResistorListTab,
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

  public readonly activeTab = signal<CircuitTab>(CircuitTab.Series);

  private readonly seriesModel = signal<ResistorListFormValue>({ resistors: ['', ''] });

  public readonly seriesForm = form(this.seriesModel, (path) => {
    applyEach(path.resistors, resistorFieldSchema);
  });

  private readonly parallelModel = signal<ResistorListFormValue>({ resistors: ['', ''] });

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
    const fieldMessage = this.getFirstFieldMessage([
      this.dividerForm.vin,
      this.dividerForm.r1,
      this.dividerForm.r2,
    ]);
    if (fieldMessage) {
      return fieldMessage;
    }

    const error = this.dividerViewModel().error;
    return error ? getCircuitValidationMessage(error.code) : '';
  });

  public setActiveTab(tab: CircuitTab): void {
    this.activeTab.set(tab);
  }

  public addResistor(formName: ResistorListTab): void {
    this.resistorListModel(formName).update((current) => ({
      resistors: [...current.resistors, ''],
    }));
  }

  public removeResistor(formName: ResistorListTab, index: number): void {
    this.resistorListModel(formName).update((current) =>
      current.resistors.length > 1
        ? { resistors: current.resistors.filter((_, i) => i !== index) }
        : current,
    );
  }

  public resistorCount(formName: ResistorListTab): number {
    return this.resistorListForm(formName).resistors.length;
  }

  public resetForm(tab: CircuitTab): void {
    switch (tab) {
      case CircuitTab.Series:
        this.seriesForm().reset({ resistors: ['', ''] });
        break;
      case CircuitTab.Parallel:
        this.parallelForm().reset({ resistors: ['', ''] });
        break;
      case CircuitTab.Divider:
        this.dividerForm().reset({ vin: '', r1: '', r2: '' });
        break;
    }
  }

  private resistorListValidationMessage(
    resistors: FieldTree<string[]>,
    error: CircuitServiceError<CircuitErrorCode> | null,
  ): string {
    const fieldMessage = this.getFirstFieldMessage(resistors);
    if (fieldMessage) {
      return fieldMessage;
    }

    return error ? getCircuitValidationMessage(error.code) : '';
  }

  private getFirstFieldMessage(fields: Iterable<FieldTree<string>>): string {
    for (const field of fields) {
      const message = field().errors()[0]?.message ?? '';
      if (message) {
        return message;
      }
    }

    return '';
  }

  private resistorListModel(formName: ResistorListTab): WritableSignal<ResistorListFormValue> {
    return formName === CircuitTab.Series ? this.seriesModel : this.parallelModel;
  }

  private resistorListForm(formName: ResistorListTab): FieldTree<ResistorListFormValue> {
    return formName === CircuitTab.Series ? this.seriesForm : this.parallelForm;
  }
}
