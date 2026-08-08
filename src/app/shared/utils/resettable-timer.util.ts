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
