import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Color } from '@resistor/resistor.model';

import { ResistorReference, ResistorReferenceService } from './resistor-reference.service';

const mockReference: ResistorReference = {
  eSeries: [{ name: 'E12', values: [10, 12, 15] }],
  tolerances: [{ color: Color.Brown, pct: 1 }],
  tcr: [{ color: Color.Brown, ppm: 100 }],
};

describe('ResistorReferenceService', () => {
  let service: ResistorReferenceService;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ResistorReferenceService],
    }).compileComponents();

    service = TestBed.inject(ResistorReferenceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('fetches reference data once and serves repeated reads from cache', async () => {
    service.reference.value();
    TestBed.tick();

    const request = httpTestingController.expectOne('/resistor-reference.json');
    expect(request.request.method).toBe('GET');

    request.flush(mockReference);
    await Promise.resolve();
    TestBed.tick();

    expect(service.reference.isLoading()).toBe(false);
    expect(service.reference.error()).toBeUndefined();
    expect(service.reference.value()).toEqual(mockReference);

    service.reference.value();
    service.reference.value();
    TestBed.tick();

    httpTestingController.expectNone('/resistor-reference.json');
  });

  it('throws when accessing value in error state', async () => {
    service.reference.value();
    TestBed.tick();

    const request = httpTestingController.expectOne('/resistor-reference.json');
    request.flush('failure', { status: 500, statusText: 'Server Error' });

    await Promise.resolve();
    TestBed.tick();

    expect(service.reference.isLoading()).toBe(false);
    expect(service.reference.error()).toBeTruthy();
    expect(() => service.reference.value()).toThrowError();
  });
});
