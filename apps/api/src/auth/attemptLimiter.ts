interface AttemptWindow {
  failures: number;
  windowStartedAt: number;
}

export class AttemptLimiter {
  private readonly attempts = new Map<string, AttemptWindow>();

  constructor(
    private readonly maxFailures = 10,
    private readonly windowMs = 15 * 60 * 1000,
    private readonly maxKeys = 50_000
  ) {}

  isBlocked(key: string, now = Date.now()): boolean {
    const current = this.current(key, now);
    return current !== undefined && current.failures >= this.maxFailures;
  }

  recordFailure(key: string, now = Date.now()): void {
    const current = this.current(key, now);
    if (!current) {
      if (this.attempts.size >= this.maxKeys) {
        for (const [candidate, attempt] of this.attempts) {
          if (now - attempt.windowStartedAt >= this.windowMs) {
            this.attempts.delete(candidate);
          }
        }
        if (this.attempts.size >= this.maxKeys) {
          const oldest = this.attempts.keys().next().value as
            | string
            | undefined;
          if (oldest) this.attempts.delete(oldest);
        }
      }
      this.attempts.set(key, { failures: 1, windowStartedAt: now });
      return;
    }
    current.failures += 1;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private current(key: string, now: number): AttemptWindow | undefined {
    const current = this.attempts.get(key);
    if (!current) return undefined;
    if (now - current.windowStartedAt >= this.windowMs) {
      this.attempts.delete(key);
      return undefined;
    }
    return current;
  }
}
