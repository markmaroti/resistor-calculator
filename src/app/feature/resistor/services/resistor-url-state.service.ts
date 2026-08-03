import { EffectRef, Injectable, Injector, OnDestroy, Signal, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ResettableTimer } from '@shared/utils/resettable-timer.util';

import { ResistorStore } from '@resistor/state/resistor.store';
import { fromQueryParams, toQueryParams } from '@resistor/state/url-state.mapper';
import {
  ResistorUrlQueryParamMap,
  ResistorUrlState,
  URL_STATE_PARAM_ORDER,
  UrlCalculatorMode,
} from '@resistor/state/url-state.model';

const URL_SYNC_DEBOUNCE_MS = 250;

type QueryParamRecord = Record<string, string | string[] | null | undefined>;

type UrlSyncSetup = {
  isReady: Signal<boolean>;
  forwardFormSyncValue: Signal<unknown>;
  reverseFormSyncValue: Signal<unknown>;
  getUrlState: () => ResistorUrlState;
};

@Injectable()
export class ResistorUrlStateService implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ResistorStore);

  private readonly urlSyncTimer = new ResettableTimer();
  private urlSyncEffectRef: EffectRef | null = null;
  private hasInitializedUrlSync = false;
  private lastScheduledUrlSyncFingerprint: string | null = null;

  public ngOnDestroy(): void {
    this.urlSyncTimer.clear();
    this.urlSyncEffectRef?.destroy();
    this.urlSyncEffectRef = null;
  }

  public hydrateStoreFromUrlState(): UrlCalculatorMode | undefined {
    const state = fromQueryParams(this.getCurrentQueryParams());
    this.store.hydrateFromUrlState(state);
    return state.mode;
  }

  public setupUrlSync(setup: UrlSyncSetup): void {
    this.urlSyncEffectRef?.destroy();

    this.urlSyncEffectRef = effect(
      () => {
        if (!setup.isReady()) {
          return;
        }

        setup.forwardFormSyncValue();
        setup.reverseFormSyncValue();

        const nextManagedParams = toQueryParams(setup.getUrlState());
        const currentQueryParams = this.getCurrentQueryParams();
        const currentManagedParams = toQueryParams(fromQueryParams(currentQueryParams));

        if (!this.hasInitializedUrlSync) {
          this.hasInitializedUrlSync = true;
          return;
        }

        if (this.areManagedQueryParamsEqual(nextManagedParams, currentManagedParams)) {
          this.lastScheduledUrlSyncFingerprint = null;
          this.urlSyncTimer.clear();
          return;
        }

        const fingerprint = this.toManagedFingerprint(nextManagedParams);
        if (fingerprint === this.lastScheduledUrlSyncFingerprint) {
          return;
        }

        this.lastScheduledUrlSyncFingerprint = fingerprint;
        this.scheduleUrlSync(nextManagedParams, fingerprint);
      },
      { injector: this.injector },
    );
  }

  public buildShareUrl(state: ResistorUrlState): string {
    const currentQueryParams = this.getCurrentQueryParams();
    const unmanagedParams = this.getUnmanagedQueryParams(currentQueryParams);
    const managedParams = toQueryParams(state);

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        ...unmanagedParams,
        ...managedParams,
      },
    });

    const serializedUrl = this.router.serializeUrl(urlTree);
    const origin = globalThis.location?.origin;

    return origin ? `${origin}${serializedUrl}` : serializedUrl;
  }

  private scheduleUrlSync(nextManagedParams: ResistorUrlQueryParamMap, fingerprint: string): void {
    this.urlSyncTimer.schedule(() => {
      const currentQueryParams = this.getCurrentQueryParams();
      const currentManagedParams = toQueryParams(fromQueryParams(currentQueryParams));

      if (this.areManagedQueryParamsEqual(nextManagedParams, currentManagedParams)) {
        this.lastScheduledUrlSyncFingerprint = null;
        return;
      }

      const unmanagedParams = this.getUnmanagedQueryParams(currentQueryParams);
      const mergedQueryParams = {
        ...unmanagedParams,
        ...nextManagedParams,
      };

      void this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: mergedQueryParams,
          replaceUrl: true,
        })
        .finally(() => {
          if (this.lastScheduledUrlSyncFingerprint === fingerprint) {
            this.lastScheduledUrlSyncFingerprint = null;
          }
        });
    }, URL_SYNC_DEBOUNCE_MS);
  }

  private areManagedQueryParamsEqual(
    left: ResistorUrlQueryParamMap,
    right: ResistorUrlQueryParamMap,
  ): boolean {
    return URL_STATE_PARAM_ORDER.every((key) => left[key] === right[key]);
  }

  private toManagedFingerprint(params: ResistorUrlQueryParamMap): string {
    return URL_STATE_PARAM_ORDER.map((key) => `${key}:${params[key] ?? ''}`).join('|');
  }

  private getCurrentQueryParams(): QueryParamRecord {
    return this.route.snapshot.queryParams as QueryParamRecord;
  }

  private getUnmanagedQueryParams(queryParams: QueryParamRecord): QueryParamRecord {
    const unmanaged: QueryParamRecord = {};

    for (const [key, value] of Object.entries(queryParams)) {
      if (!URL_STATE_PARAM_ORDER.includes(key as (typeof URL_STATE_PARAM_ORDER)[number])) {
        unmanaged[key] = value;
      }
    }

    return unmanaged;
  }
}
