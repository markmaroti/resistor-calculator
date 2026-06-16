import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to forward mode', () => {
    expect(component.mode()).toBe('forward');
  });

  it('switches to reverse mode', () => {
    component.setMode('reverse');
    expect(component.mode()).toBe('reverse');
  });

  it('switches back to forward mode after reverse mode', () => {
    component.setMode('reverse');
    expect(component.mode()).toBe('reverse');

    component.setMode('forward');
    expect(component.mode()).toBe('forward');
  });

  it('detects when form is at defaults', () => {
    expect(component.isAtDefaults()).toBe(true);

    component.form.patchValue({ bandCount: 5 });
    expect(component.isAtDefaults()).toBe(false);

    component.resetToDefaults();
    expect(component.isAtDefaults()).toBe(true);
  });

  it('resets form values back to defaults', () => {
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

  it('resets computed result to default value state', () => {
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

    const vm = component.viewModel();
    expect(vm.ohms).toBe(10);
    expect(vm.tolerancePct).toBe(5);
    expect(vm.tcrPpm).toBeNull();
  });

  it('disables copy for invalid bands', () => {
    component.form.patchValue({ digit1: Color.Gold });
    expect(component.isCopyEnabled()).toBe(false);
  });

  it('enables copy for valid default bands', () => {
    expect(component.isCopyEnabled()).toBe(true);
  });

  it('applies candidate and switches to forward mode with feedback', () => {
    const candidates = component.reverseViewModel().candidates;
    expect(candidates.length).toBeGreaterThan(0);

    component.applyCandidate(candidates[0]);

    expect(component.mode()).toBe('forward');
    expect(component.viewModel().ohms).toBeGreaterThan(0);
    expect(component.applyFeedback()).toBe('Candidate applied to band form.');
  });

  it('shows success feedback when copy succeeds', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    await component.copyResult();

    expect(component.copyState()).toBe('success');
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

    await component.copyResult();

    expect(component.copyState()).toBe('error');
  });
});
