import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { CircuitStore } from '@circuit/state/circuit.store';

import { ResistorListPanelComponent } from './resistor-list-panel.component';

describe('ResistorListPanelComponent', () => {
  let fixture: ComponentFixture<ResistorListPanelComponent>;
  let store: CircuitStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResistorListPanelComponent],
      providers: [CircuitStore],
    }).compileComponents();

    store = TestBed.inject(CircuitStore);
    fixture = TestBed.createComponent(ResistorListPanelComponent);
  });

  it('shows placeholder when totalOhms is null and no validation message', async () => {
    fixture.componentRef.setInput('form', store.seriesForm);
    fixture.componentRef.setInput('totalOhms', null);
    fixture.componentRef.setInput('validationMessage', '');
    fixture.detectChanges();
    await fixture.whenStable();

    const placeholder = fixture.debugElement.query(By.css('.circuit-placeholder'));
    expect(placeholder).toBeTruthy();
    expect(placeholder.nativeElement.textContent.trim()).toBe(
      'Enter resistor values to calculate.',
    );
  });

  it('shows validation error message when totalOhms is null and message is set', async () => {
    fixture.componentRef.setInput('form', store.seriesForm);
    fixture.componentRef.setInput('totalOhms', null);
    fixture.componentRef.setInput('validationMessage', 'Resistance value is required.');
    fixture.detectChanges();
    await fixture.whenStable();

    const error = fixture.debugElement.query(By.css('.circuit-error'));
    expect(error).toBeTruthy();
    expect(error.nativeElement.textContent.trim()).toBe('Resistance value is required.');
  });

  it('shows formatted result when totalOhms is provided', async () => {
    fixture.componentRef.setInput('form', store.seriesForm);
    fixture.componentRef.setInput('totalOhms', 1500);
    fixture.componentRef.setInput('validationMessage', '');
    fixture.detectChanges();
    await fixture.whenStable();

    const result = fixture.debugElement.query(By.css('.circuit-result'));
    expect(result).toBeTruthy();
    expect(result.nativeElement.textContent).toContain('kΩ');
  });

  it('hides remove button when only one resistor is present', async () => {
    store.removeResistor('series', 1);
    fixture.componentRef.setInput('form', store.seriesForm);
    fixture.componentRef.setInput('totalOhms', null);
    fixture.componentRef.setInput('validationMessage', '');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.debugElement.query(By.css('.action-remove'))).toBeNull();
  });
});
