import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { ReverseShellComponent } from './reverse-shell.component';
import { ReverseErrorCode, ReverseCandidate } from '../../resistor.model';
import { ReverseViewModel } from '../../state/resistor.mappers';
import { ReverseValueErrorCode } from '../../utils/reverse-value.util';

const mockCandidates: ReverseCandidate[] = [
  {
    bands: {
      bandCount: 4,
      digit1: 'Brown' as const,
      digit2: 'Black' as const,
      digit3: 'Black' as const,
      multiplier: 'Red' as const,
      tolerance: 'Gold' as const,
      tcr: 'Brown' as const,
    },
    ohms: 1000,
    tolerancePct: 5,
    tcrPpm: null,
    deltaOhms: 0,
    deltaPct: 0,
  },
];

const defaultVm: ReverseViewModel = {
  targetInput: '1k',
  targetOhms: 1000,
  bandCount: 4,
  tolerancePct: null,
  tcrPpm: null,
  mode: 'EXACT',
  isValidTarget: true,
  parseErrorCode: null,
  serviceErrorCode: null,
  candidates: mockCandidates,
  showTcr: false,
};

describe('ReverseShellComponent', () => {
  let component: ReverseShellComponent;
  let fixture: ComponentFixture<ReverseShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReverseShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReverseShellComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('reverseForm', new FormGroup({
      targetInput: new FormControl('', { nonNullable: true }),
      bandCount: new FormControl(4, { nonNullable: true }),
      tolerancePct: new FormControl<number | null>(null),
      tcrPpm: new FormControl<number | null>(null),
      mode: new FormControl('EXACT', { nonNullable: true }),
    }));
    fixture.componentRef.setInput('reverseViewModel', defaultVm);
    fixture.componentRef.setInput('reverseValidationMessage', '');
    fixture.componentRef.setInput('bandCounts', [4, 5, 6]);
    fixture.componentRef.setInput('reverseModes', ['EXACT', 'NEAREST']);
  });

  it('has no error when candidates are present', () => {
    expect(component.hasReverseError()).toBe(false);
    expect(component.hasReverseNoCandidates()).toBe(false);
  });

  it('detects parse error state', () => {
    fixture.componentRef.setInput('reverseViewModel', {
      ...defaultVm,
      parseErrorCode: ReverseValueErrorCode.InvalidFormat,
    });

    expect(component.hasReverseError()).toBe(true);
    expect(component.hasReverseNoCandidates()).toBe(false);
  });

  it('detects InvalidTargetOhms error state', () => {
    fixture.componentRef.setInput('reverseViewModel', {
      ...defaultVm,
      serviceErrorCode: ReverseErrorCode.InvalidTargetOhms,
    });

    expect(component.hasReverseError()).toBe(true);
    expect(component.hasReverseNoCandidates()).toBe(false);
  });

  it('detects NoCandidates state', () => {
    fixture.componentRef.setInput('reverseViewModel', {
      ...defaultVm,
      serviceErrorCode: ReverseErrorCode.NoCandidates,
      candidates: [],
    });

    expect(component.hasReverseError()).toBe(false);
    expect(component.hasReverseNoCandidates()).toBe(true);
  });

  it('treats other service errors as neither error nor no-candidates', () => {
    fixture.componentRef.setInput('reverseViewModel', {
      ...defaultVm,
      serviceErrorCode: ReverseErrorCode.UnsupportedBandCount,
      candidates: [],
    });

    expect(component.hasReverseError()).toBe(false);
    expect(component.hasReverseNoCandidates()).toBe(false);
  });
});
