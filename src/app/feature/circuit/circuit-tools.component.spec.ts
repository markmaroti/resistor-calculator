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

  it('switches between tabs', async () => {
    component.store.setActiveTab('parallel');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.store.activeTab()).toBe('parallel');

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
