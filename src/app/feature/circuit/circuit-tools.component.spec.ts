import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { CircuitToolsComponent } from './circuit-tools.component';

describe('CircuitToolsComponent', () => {
  let component: CircuitToolsComponent;
  let fixture: ComponentFixture<CircuitToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircuitToolsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CircuitToolsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to Series tab', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.store.activeTab()).toBe('series');
    expect(fixture.debugElement.query(By.css('.circuit-error'))).toBeTruthy();
    const labels = fixture.debugElement.queryAll(By.css('.circuit-controls label'));
    expect(labels.length).toBe(2);
    expect(labels[0].nativeElement.textContent).toContain('R1');
    expect(labels[1].nativeElement.textContent).toContain('R2');
  });

  it('switches between tabs', async () => {
    component.store.setActiveTab('parallel');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.store.activeTab()).toBe('parallel');

    const tabButtons = fixture.debugElement.queryAll(By.css('.circuit-tab'));
    expect(tabButtons[1].nativeElement.getAttribute('aria-selected')).toBe('true');
    expect(tabButtons[0].nativeElement.getAttribute('aria-selected')).toBe('false');

    component.store.setActiveTab('divider');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.store.activeTab()).toBe('divider');

    const labels = fixture.debugElement.queryAll(By.css('.circuit-controls label'));
    expect(labels.length).toBe(3);
    expect(labels[0].nativeElement.textContent).toContain('Vin');
    expect(labels[1].nativeElement.textContent).toContain('R1');
    expect(labels[2].nativeElement.textContent).toContain('R2');
  });

  it('shows validation error when series inputs are empty', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.debugElement.query(By.css('.circuit-error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.getAttribute('role')).toBe('alert');
    expect(errorEl.nativeElement.textContent.trim()).toBe(
      'All resistor values must be valid numbers greater than 0.',
    );
  });

  it('calculates series total resistance for valid inputs', async () => {
    component.store.seriesForm.controls.resistors.at(0).setValue('1000');
    component.store.seriesForm.controls.resistors.at(1).setValue('2000');
    fixture.detectChanges();
    await fixture.whenStable();

    const resultValue = fixture.debugElement.query(By.css('.result-value'));
    expect(resultValue).toBeTruthy();
    expect(resultValue.nativeElement.textContent.trim()).toBe('3.00 kΩ');
  });

  it('shows validation error for invalid series input', async () => {
    component.store.seriesForm.controls.resistors.at(0).setValue('abc');
    component.store.seriesForm.controls.resistors.at(1).setValue('2000');
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.debugElement.query(By.css('.circuit-error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent.trim()).toBe(
      'All resistor values must be valid numbers greater than 0.',
    );
  });

  it('adds and removes series resistor inputs', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    let inputs = fixture.debugElement.queryAll(By.css('.circuit-input'));
    expect(inputs.length).toBe(2);

    component.store.addResistor('series');
    fixture.detectChanges();
    await fixture.whenStable();

    inputs = fixture.debugElement.queryAll(By.css('.circuit-input'));
    expect(inputs.length).toBe(3);

    const removeButton = fixture.debugElement.query(By.css('.action-remove'));
    expect(removeButton).toBeTruthy();

    component.removeLastResistor('series');
    fixture.detectChanges();
    await fixture.whenStable();

    inputs = fixture.debugElement.queryAll(By.css('.circuit-input'));
    expect(inputs.length).toBe(2);

    component.removeLastResistor('series');
    fixture.detectChanges();
    await fixture.whenStable();

    inputs = fixture.debugElement.queryAll(By.css('.circuit-input'));
    expect(inputs.length).toBe(1);

    const removeButtonAfter = fixture.debugElement.query(By.css('.action-remove'));
    expect(removeButtonAfter).toBeNull();
  });

  it('calculates parallel total resistance', async () => {
    component.store.setActiveTab('parallel');
    component.store.parallelForm.controls.resistors.at(0).setValue('1000');
    component.store.parallelForm.controls.resistors.at(1).setValue('2000');
    fixture.detectChanges();
    await fixture.whenStable();

    const resultValue = fixture.debugElement.query(By.css('.result-value'));
    expect(resultValue).toBeTruthy();
    expect(resultValue.nativeElement.textContent.trim()).toBe('667 Ω');
  });

  it('shows validation error for invalid parallel input', async () => {
    component.store.setActiveTab('parallel');
    component.store.parallelForm.controls.resistors.at(0).setValue('0');
    component.store.parallelForm.controls.resistors.at(1).setValue('2000');
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.debugElement.query(By.css('.circuit-error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent.trim()).toBe(
      'All resistor values must be valid numbers greater than 0.',
    );
  });

  it('calculates divider Vout and current for valid inputs', async () => {
    component.store.setActiveTab('divider');
    component.store.dividerForm.controls.vin.setValue('5');
    component.store.dividerForm.controls.r1.setValue('1000');
    component.store.dividerForm.controls.r2.setValue('2000');
    fixture.detectChanges();
    await fixture.whenStable();

    const resultValues = fixture.debugElement.queryAll(By.css('.result-value'));
    expect(resultValues.length).toBe(2);
    expect(resultValues[0].nativeElement.textContent.trim()).toBe('3.33 V');
    expect(resultValues[1].nativeElement.textContent.trim()).toBe('1.67 mA');
  });

  it('renders back link with routerLink', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const backLink = fixture.debugElement.query(By.css('a[routerLink="/"]'));
    expect(backLink).toBeTruthy();
    expect(backLink.nativeElement.textContent).toContain('Back to calculator');
  });
});
