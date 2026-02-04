import { Component, input, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true,
    },
  ],
})
export class SelectComponent<T> implements ControlValueAccessor {
  public readonly label = input.required<string>();
  public readonly options = input.required<readonly T[]>();
  public readonly value = input<T | null>(null);

  public readonly valueChange = output<T>();
  
  public isDisabled = false;
  private cvaValue: T | null = null;
  private onCvaChange: (value: T) => void = () => {};
  private onCvaTouched: () => void = () => {};

  public get selectedValue(): T | null {
    return this.value() ?? this.cvaValue;
  }

  public onChange(selectedIndex: string) {
    const index = Number(selectedIndex);
    const option = this.options()[index];
    if (option !== undefined) {
      this.cvaValue = option;
      this.valueChange.emit(option);
      this.onCvaChange(option);
    }
  }

  public onTouched() {
    this.onCvaTouched();
  }

  public writeValue(value: T | null): void {
    this.cvaValue = value;
  }

  public registerOnChange(fn: (value: T) => void): void {
    this.onCvaChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onCvaTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
