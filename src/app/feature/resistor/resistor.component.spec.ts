import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { ResistorComponent } from './resistor.component';
import { Color } from './resistor.model';

describe('ResistorComponent', () => {
  let component: ResistorComponent;
  let fixture: ComponentFixture<ResistorComponent>;
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  let routeQueryParams: Record<string, string | string[] | null | undefined>;

  async function createComponent(
    queryParams: Record<string, string | string[] | null | undefined> = {},
  ): Promise<void> {
    routeQueryParams = { ...queryParams };

    await TestBed.configureTestingModule({
      imports: [ResistorComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: routeQueryParams,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResistorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function replaceRouteQueryParams(
    next: Record<string, string | string[] | null | undefined>,
  ): void {
    for (const key of Object.keys(routeQueryParams)) {
      delete routeQueryParams[key];
    }

    Object.assign(routeQueryParams, next);
  }

  async function waitForUrlSync(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 320));
  }

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('does not sync URL during initial hydration', async () => {
    await createComponent({
      mode: 'forward',
      bc: '4',
      d1: 'Brown',
      d2: 'Black',
      m: 'Black',
      t: 'Gold',
    });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('hydrates form state and mode from valid URL query params', async () => {
    await createComponent({
      mode: 'reverse',
      bc: '6',
      d1: 'Red',
      d2: 'Violet',
      d3: 'Black',
      m: 'Orange',
      t: 'Brown',
      tc: 'Blue',
      rti: '2.2k',
      rbc: '6',
      rt: '1',
      rtc: '25',
      rm: 'NEAREST',
    });

    expect(component.mode()).toBe('reverse');
    expect(component.form.getRawValue()).toEqual({
      bandCount: 6,
      digit1: Color.Red,
      digit2: Color.Violet,
      digit3: Color.Black,
      multiplier: Color.Orange,
      tolerance: Color.Brown,
      tcr: Color.Blue,
    });
    expect(component.reverseForm.getRawValue()).toEqual({
      targetInput: '2.2k',
      bandCount: 6,
      tolerancePct: 1,
      tcrPpm: 25,
      mode: 'NEAREST',
    });
  });

  it('keeps defaults when URL query params are invalid', async () => {
    await createComponent({
      mode: 'invalid',
      bc: '8',
      d1: 'Pink',
      rti: '   ',
      rt: '0',
      rm: 'INVALID',
    });

    expect(component.mode()).toBe('forward');
    expect(component.form.getRawValue()).toEqual({
      bandCount: 4,
      digit1: Color.Brown,
      digit2: Color.Black,
      digit3: Color.Black,
      multiplier: Color.Black,
      tolerance: Color.Gold,
      tcr: Color.Brown,
    });
    expect(component.reverseForm.getRawValue()).toEqual({
      targetInput: '1k',
      bandCount: 4,
      tolerancePct: null,
      tcrPpm: null,
      mode: 'EXACT',
    });
  });

  it('syncs URL with debounce and replaceUrl on form change', async () => {
    await createComponent();

    component.form.patchValue({ digit1: Color.Red });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        replaceUrl: true,
        relativeTo: expect.any(Object),
        queryParams: expect.objectContaining({
          mode: 'forward',
          bc: '4',
          d1: 'Red',
          d2: 'Black',
          m: 'Black',
          t: 'Gold',
        }),
      }),
    );
  });

  it('preserves unmanaged query params while syncing managed params', async () => {
    await createComponent({
      utm_source: 'newsletter',
      ref: 'campaign',
    });

    component.form.patchValue({ digit1: Color.Red });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({
          utm_source: 'newsletter',
          ref: 'campaign',
          d1: 'Red',
        }),
      }),
    );
  });

  it('debounces rapid changes into a single URL sync', async () => {
    await createComponent();

    component.form.patchValue({ digit1: Color.Red });
    component.form.patchValue({ digit1: Color.Blue });
    component.form.patchValue({ digit1: Color.Orange });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({
          d1: 'Orange',
        }),
      }),
    );
  });

  it('syncs calculator mode changes to URL state', async () => {
    await createComponent();

    component.setMode('reverse');
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({
          mode: 'reverse',
          rti: '1k',
          rbc: '4',
          rm: 'EXACT',
        }),
      }),
    );
  });

  it('skips navigation when managed query state is unchanged', async () => {
    await createComponent({
      mode: 'forward',
      bc: '4',
      d1: 'Brown',
      d2: 'Black',
      m: 'Black',
      t: 'Gold',
    });

    component.form.patchValue({ digit1: Color.Brown });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('does not re-navigate after route snapshot catches up to synced query', async () => {
    await createComponent();

    component.form.patchValue({ digit1: Color.Red });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    const firstSyncedQuery = navigateSpy.mock.calls[0][1].queryParams as Record<
      string,
      string | string[] | null | undefined
    >;

    replaceRouteQueryParams(firstSyncedQuery);

    component.form.patchValue({ digit2: Color.Black });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('preserves unmanaged query params across multiple sync cycles', async () => {
    await createComponent({
      utm_source: 'newsletter',
      ref: 'campaign',
    });

    component.form.patchValue({ digit1: Color.Red });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    const firstSyncedQuery = navigateSpy.mock.calls[0][1].queryParams as Record<
      string,
      string | string[] | null | undefined
    >;
    expect(firstSyncedQuery['utm_source']).toBe('newsletter');
    expect(firstSyncedQuery['ref']).toBe('campaign');

    replaceRouteQueryParams(firstSyncedQuery);

    component.form.patchValue({ digit1: Color.Blue });
    fixture.detectChanges();
    await waitForUrlSync();

    expect(navigateSpy).toHaveBeenCalledTimes(2);
    const secondSyncedQuery = navigateSpy.mock.calls[1][1].queryParams as Record<
      string,
      string | string[] | null | undefined
    >;
    expect(secondSyncedQuery['utm_source']).toBe('newsletter');
    expect(secondSyncedQuery['ref']).toBe('campaign');
    expect(secondSyncedQuery['d1']).toBe('Blue');
  });

  it('applies candidate and switches to forward mode with feedback', async () => {
    await createComponent();

    const candidates = component.reverseViewModel().candidates;
    expect(candidates.length).toBeGreaterThan(0);

    component.applyCandidate(candidates[0]);

    expect(component.mode()).toBe('forward');
    expect(component.viewModel().ohms).toBeGreaterThan(0);
    expect(component.applyFeedback()).toBe('Candidate applied to band form.');
  });

  it('shows success feedback when copy succeeds', async () => {
    await createComponent();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    await component.copyResult();

    expect(component.copyState()).toBe('success');
  });

  it('copies share link with current managed and unmanaged query params', async () => {
    await createComponent({
      utm_source: 'newsletter',
      ref: 'campaign',
    });

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    component.form.patchValue({ digit1: Color.Red, bandCount: 6, tcr: Color.Blue });
    component.setMode('reverse');

    await component.copyShareLink();

    expect(component.shareLinkCopyState()).toBe('success');
    expect(writeText).toHaveBeenCalledTimes(1);
    const copiedUrl = writeText.mock.calls[0][0] as string;
    const parsed = new URL(copiedUrl);

    expect(parsed.searchParams.get('utm_source')).toBe('newsletter');
    expect(parsed.searchParams.get('ref')).toBe('campaign');
    expect(parsed.searchParams.get('mode')).toBe('reverse');
    expect(parsed.searchParams.get('bc')).toBe('6');
    expect(parsed.searchParams.get('d1')).toBe('Red');
    expect(parsed.searchParams.get('tc')).toBe('Blue');
    expect(parsed.searchParams.get('rti')).toBe('1k');
    expect(parsed.searchParams.get('rbc')).toBe('4');
    expect(parsed.searchParams.get('rm')).toBe('EXACT');
  });

  it('shows error feedback when share link copy fails', async () => {
    await createComponent();

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

    await component.copyShareLink();

    expect(component.shareLinkCopyState()).toBe('error');
  });

  it('shows error feedback when copy fails', async () => {
    await createComponent();

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
