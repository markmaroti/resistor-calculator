import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { FieldTree, apply, applyEach, form } from '@angular/forms/signals';

import { firstFieldErrorMessageInPriorityOrder, isBlank } from '@shared/utils/signal-forms.util';

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
import { getCircuitServiceValidationMessage } from './validation-messages';

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

  public readonly seriesValidationMessage = computed(() => {
    if (!this.hasAnyResistorInput(this.seriesForm)) {
      return '';
    }

    return this.resistorListValidationMessage(
      this.seriesForm.resistors,
      this.seriesViewModel().error,
    );
  });

  public readonly parallelValidationMessage = computed(() => {
    if (!this.hasAnyResistorInput(this.parallelForm)) {
      return '';
    }

    return this.resistorListValidationMessage(
      this.parallelForm.resistors,
      this.parallelViewModel().error,
    );
  });

  public readonly dividerValidationMessage = computed(() => {
    if (!this.hasAnyInput(Object.values(this.dividerForm().value()))) {
      return '';
    }

    const fieldMessage = firstFieldErrorMessageInPriorityOrder([
      this.dividerForm.vin,
      this.dividerForm.r1,
      this.dividerForm.r2,
    ]);
    if (fieldMessage) {
      return fieldMessage;
    }

    const error = this.dividerViewModel().error;
    return error ? getCircuitServiceValidationMessage(error.code) : '';
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
    const fieldMessage = resistors().errorSummary()[0]?.message ?? '';
    if (fieldMessage) {
      return fieldMessage;
    }

    return error ? getCircuitServiceValidationMessage(error.code) : '';
  }

  private resistorListModel(formName: ResistorListTab): WritableSignal<ResistorListFormValue> {
    return formName === CircuitTab.Series ? this.seriesModel : this.parallelModel;
  }

  private resistorListForm(formName: ResistorListTab): FieldTree<ResistorListFormValue> {
    return formName === CircuitTab.Series ? this.seriesForm : this.parallelForm;
  }

  private hasAnyResistorInput(formTree: FieldTree<ResistorListFormValue>): boolean {
    return this.hasAnyInput(formTree().value().resistors);
  }

  private hasAnyInput(values: readonly string[]): boolean {
    return values.some((value) => !isBlank(value));
  }
}
