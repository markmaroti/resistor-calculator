import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { CircuitStore } from '@circuit/state/circuit.store';

import { DividerPanelComponent } from './divider-panel.component';

describe('DividerPanelComponent', () => {
  let fixture: ComponentFixture<DividerPanelComponent>;
  let store: CircuitStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerPanelComponent],
      providers: [CircuitStore],
    }).compileComponents();

    store = TestBed.inject(CircuitStore);
    fixture = TestBed.createComponent(DividerPanelComponent);
  });

  it('shows placeholder when vout is null and no validation message', async () => {
    fixture.componentRef.setInput('form', store.dividerForm);
    fixture.componentRef.setInput('vout', null);
    fixture.componentRef.setInput('current', null);
    fixture.componentRef.setInput('validationMessage', '');
    fixture.detectChanges();
    await fixture.whenStable();

    const placeholder = fixture.debugElement.query(By.css('.circuit-placeholder'));
    expect(placeholder).toBeTruthy();
    expect(placeholder.nativeElement.textContent.trim()).toBe('Enter voltage and resistor values.');
  });

  it('shows validation error when vout is null and message is set', async () => {
    fixture.componentRef.setInput('form', store.dividerForm);
    fixture.componentRef.setInput('vout', null);
    fixture.componentRef.setInput('current', null);
    fixture.componentRef.setInput('validationMessage', 'Resistance value is required.');
    fixture.detectChanges();
    await fixture.whenStable();

    const error = fixture.debugElement.query(By.css('.circuit-error'));
    expect(error).toBeTruthy();
    expect(error.nativeElement.textContent.trim()).toBe('Resistance value is required.');
  });

  it('shows formatted vout and current when values are provided', async () => {
    fixture.componentRef.setInput('form', store.dividerForm);
    fixture.componentRef.setInput('vout', 3.3);
    fixture.componentRef.setInput('current', 0.0033);
    fixture.componentRef.setInput('validationMessage', '');
    fixture.detectChanges();
    await fixture.whenStable();

    const result = fixture.debugElement.query(By.css('.circuit-result-double'));
    expect(result).toBeTruthy();
    expect(result.nativeElement.textContent).toContain('V');
    expect(result.nativeElement.textContent).toContain('mA');
  });
});
