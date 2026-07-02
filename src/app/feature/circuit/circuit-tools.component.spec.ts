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

  it('renders the correct panel when switching tabs', async () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('app-resistor-list-panel'))).toBeTruthy();

    component.store.setActiveTab('parallel');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('app-resistor-list-panel'))).toBeTruthy();

    component.store.setActiveTab('divider');
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
    component.store.addResistor('series');
    const removeSpy = vi.spyOn(component.store, 'removeResistor');

    component.removeLastResistor('series');
    expect(removeSpy).toHaveBeenCalledWith('series', 2);
  });

  it('removeLastResistor uses the last parallel index', async () => {
    component.store.setActiveTab('parallel');
    component.store.addResistor('parallel');
    component.store.addResistor('parallel');
    const removeSpy = vi.spyOn(component.store, 'removeResistor');

    component.removeLastResistor('parallel');
    expect(removeSpy).toHaveBeenCalledWith('parallel', 3);
  });
});
