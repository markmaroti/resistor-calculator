import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResistorStore } from '@resistor/state/resistor.store';
import { ResistorUrlState } from '@resistor/state/url-state.model';

import { ResistorUrlStateService } from './resistor-url-state.service';

describe('ResistorUrlStateService', () => {
  let service: ResistorUrlStateService;
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  let hydrateFromUrlState: ReturnType<typeof vi.fn>;
  let routeQueryParams: Record<string, string | string[] | null | undefined>;

  async function createService(
    queryParams: Record<string, string | string[] | null | undefined> = {},
  ): Promise<void> {
    routeQueryParams = { ...queryParams };
    hydrateFromUrlState = vi.fn();

    await TestBed.configureTestingModule({
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
        {
          provide: ResistorStore,
          useValue: {
            hydrateFromUrlState,
          },
        },
        ResistorUrlStateService,
      ],
    }).compileComponents();

    service = TestBed.inject(ResistorUrlStateService);
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  }

  function buildForwardState(digit1: string): ResistorUrlState {
    return {
      mode: 'forward',
      forward: {
        bandCount: '4',
        digit1,
        digit2: 'Black',
        multiplier: 'Black',
        tolerance: 'Gold',
      },
    };
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('hydrates store from query params and returns calculator mode', async () => {
    await createService({
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

    const mode = service.hydrateStoreFromUrlState();

    expect(mode).toBe('reverse');
    expect(hydrateFromUrlState).toHaveBeenCalledWith({
      mode: 'reverse',
      forward: {
        bandCount: '6',
        digit1: 'Red',
        digit2: 'Violet',
        digit3: 'Black',
        multiplier: 'Orange',
        tolerance: 'Brown',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: '2.2k',
        bandCount: '6',
        tolerancePct: '1',
        tcrPpm: '25',
        mode: 'NEAREST',
      },
    });
  });

  it('builds share URL with managed and unmanaged params', async () => {
    await createService({
      utm_source: 'newsletter',
      ref: 'campaign',
    });

    const shareUrl = service.buildShareUrl({
      mode: 'reverse',
      forward: {
        bandCount: '6',
        digit1: 'Red',
        digit2: 'Black',
        digit3: 'Black',
        multiplier: 'Black',
        tolerance: 'Gold',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: '1k',
        bandCount: '4',
        mode: 'EXACT',
      },
    });

    const parsed = new URL(shareUrl);

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

  it('debounces URL sync and keeps unmanaged params', async () => {
    await createService({ utm_source: 'newsletter' });

    const isReady = signal(false);
    const forwardFormSyncValue = signal(0);
    const reverseFormSyncValue = signal(0);
    let nextState = buildForwardState('Red');

    service.setupUrlSync({
      isReady,
      forwardFormSyncValue,
      reverseFormSyncValue,
      getUrlState: () => nextState,
    });

    isReady.set(true);
    TestBed.flushEffects();

    nextState = buildForwardState('Blue');
    forwardFormSyncValue.update((value) => value + 1);
    TestBed.flushEffects();

    nextState = buildForwardState('Orange');
    forwardFormSyncValue.update((value) => value + 1);
    TestBed.flushEffects();

    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        replaceUrl: true,
        relativeTo: expect.any(Object),
        queryParams: expect.objectContaining({
          utm_source: 'newsletter',
          mode: 'forward',
          d1: 'Orange',
        }),
      }),
    );
  });

  it('skips sync when managed params already match URL', async () => {
    await createService({
      mode: 'forward',
      bc: '4',
      d1: 'Brown',
      d2: 'Black',
      m: 'Black',
      t: 'Gold',
    });

    const isReady = signal(false);
    const forwardFormSyncValue = signal(0);
    const reverseFormSyncValue = signal(0);

    service.setupUrlSync({
      isReady,
      forwardFormSyncValue,
      reverseFormSyncValue,
      getUrlState: () => buildForwardState('Brown'),
    });

    isReady.set(true);
    TestBed.flushEffects();
    forwardFormSyncValue.update((value) => value + 1);
    TestBed.flushEffects();

    vi.advanceTimersByTime(300);
    await Promise.resolve();

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
