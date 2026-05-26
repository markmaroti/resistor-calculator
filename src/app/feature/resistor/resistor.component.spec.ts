import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { ResistorComponent } from './resistor.component';
import { Color } from './resistor.model';

describe('ResistorComponent', () => {
  let component: ResistorComponent;
  let fixture: ComponentFixture<ResistorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResistorComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResistorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resets form values back to defaults', async () => {
    component.form.patchValue({
      bandCount: 6,
      digit1: Color.Orange,
      digit2: Color.Orange,
      digit3: Color.Black,
      multiplier: Color.Brown,
      tolerance: Color.Brown,
      tcr: Color.Violet,
    });

    component.resetToDefaults();
    await fixture.whenStable();

    expect(component.form.getRawValue()).toEqual({
      bandCount: 4,
      digit1: Color.Brown,
      digit2: Color.Black,
      digit3: Color.Black,
      multiplier: Color.Black,
      tolerance: Color.Gold,
      tcr: Color.Brown,
    });
  });

  it('resets computed result to default value state', async () => {
    component.form.patchValue({
      bandCount: 6,
      digit1: Color.Orange,
      digit2: Color.Orange,
      digit3: Color.Black,
      multiplier: Color.Brown,
      tolerance: Color.Brown,
      tcr: Color.Violet,
    });
    await fixture.whenStable();

    component.resetToDefaults();
    await fixture.whenStable();

    const vm = component.viewModel();
    expect(vm.ohms).toBe(10);
    expect(vm.tolerancePct).toBe(5);
    expect(vm.tcrPpm).toBeNull();
  });

  it('disables reset button at defaults and enables after change', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const resetButtonEl = fixture.debugElement.query(By.css('.help-reset'))
      .nativeElement as HTMLButtonElement;
    expect(resetButtonEl.disabled).toBe(true);

    component.form.patchValue({ bandCount: 5 });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isAtDefaults()).toBe(false);
    expect(resetButtonEl.disabled).toBe(false);

    component.resetToDefaults();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isAtDefaults()).toBe(true);
    expect(resetButtonEl.disabled).toBe(true);
  });
});
