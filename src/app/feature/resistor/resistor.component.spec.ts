import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

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

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('disables copy button when there is no valid resistance', async () => {
    component.form.patchValue({ digit1: Color.Gold });
    fixture.detectChanges();
    await fixture.whenStable();

    const copyButtonEl = fixture.debugElement.query(By.css('.copy-trigger')).nativeElement as HTMLButtonElement;
    expect(copyButtonEl.disabled).toBe(true);
  });

  it('enables copy button when resistance is valid', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const copyButtonEl = fixture.debugElement.query(By.css('.copy-trigger')).nativeElement as HTMLButtonElement;
    expect(copyButtonEl.disabled).toBe(false);
  });

  it('shows success feedback when copy succeeds', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    fixture.detectChanges();

    await component.copyResult();
    fixture.detectChanges();

    expect(component.copyState()).toBe('success');
    const feedback = fixture.debugElement.query(By.css('.copy-feedback')).nativeElement as HTMLElement;
    expect(feedback.textContent?.trim()).toBe('Copied to clipboard.');
  });

  it('shows error feedback when copy fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('copy failed')),
      },
    });
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
      writable: true,
    });
    fixture.detectChanges();

    await component.copyResult();
    fixture.detectChanges();

    expect(component.copyState()).toBe('error');
    const feedback = fixture.debugElement.query(By.css('.copy-feedback')).nativeElement as HTMLElement;
    expect(feedback.textContent?.trim()).toBe('Copy failed.');
  });
});
