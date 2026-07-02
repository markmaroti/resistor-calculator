import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResistorClipboardService } from './resistor-clipboard.service';

describe('ResistorClipboardService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sets result copy state to success then resets', async () => {
    const service = new ResistorClipboardService();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    await service.copyResistanceResult({
      ohms: 1000,
      tolerancePct: 5,
      tcrPpm: null,
    });

    expect(service.resultCopyState()).toBe('success');

    vi.advanceTimersByTime(1500);
    expect(service.resultCopyState()).toBe('idle');
  });

  it('sets share copy state to error when copy fails', async () => {
    const service = new ResistorClipboardService();
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

    await service.copyShareLink('https://example.test/?mode=forward');

    expect(service.shareLinkCopyState()).toBe('error');

    vi.advanceTimersByTime(1500);
    expect(service.shareLinkCopyState()).toBe('idle');
  });
});
