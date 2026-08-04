import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { CircuitTab } from './circuit.model';
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

  it('renders the correct panel when switching tabs', async () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('app-resistor-list-panel'))).toBeTruthy();

    component.store.setActiveTab(CircuitTab.Parallel);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('app-resistor-list-panel'))).toBeTruthy();

    component.store.setActiveTab(CircuitTab.Divider);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('app-divider-panel'))).toBeTruthy();
  });

  it('shows series validation message from store state', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const errorEl = fixture.debugElement.query(By.css('.circuit-error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent.trim()).toBe('Resistance value is required.');
  });

  it('removeLastResistor uses the last series index', async () => {
    component.store.addResistor(CircuitTab.Series);
    const removeSpy = vi.spyOn(component.store, 'removeResistor');

    component.removeLastResistor(CircuitTab.Series);
    expect(removeSpy).toHaveBeenCalledWith(CircuitTab.Series, 2);
  });

  it('removeLastResistor uses the last parallel index', async () => {
    component.store.setActiveTab(CircuitTab.Parallel);
    component.store.addResistor(CircuitTab.Parallel);
    component.store.addResistor(CircuitTab.Parallel);
    const removeSpy = vi.spyOn(component.store, 'removeResistor');

    component.removeLastResistor(CircuitTab.Parallel);
    expect(removeSpy).toHaveBeenCalledWith(CircuitTab.Parallel, 3);
  });
});
