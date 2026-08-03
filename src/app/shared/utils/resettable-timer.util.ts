/**
 * A single-slot timer handle that automatically clears any previously scheduled
 * callback before scheduling a new one, so callers don't need to hand-roll a
 * nullable `ReturnType<typeof setTimeout>` field alongside their own clear logic.
 */
export class ResettableTimer {
  private handle: ReturnType<typeof setTimeout> | null = null;

  public schedule(callback: () => void, delayMs: number): void {
    this.clear();
    this.handle = setTimeout(callback, delayMs);
  }

  public clear(): void {
    if (this.handle !== null) {
      clearTimeout(this.handle);
      this.handle = null;
    }
  }
}
