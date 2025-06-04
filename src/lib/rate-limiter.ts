// 📁 src/lib/rate-limiter.ts
interface AttemptRecord {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

class RateLimiter {
  private attempts = new Map<string, AttemptRecord>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 60000, blockDurationMs = 900000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;

    const now = Date.now();
    
    // Si el bloqueo ha expirado, limpiar
    if (record.blocked && (now - record.lastAttempt) > this.blockDurationMs) {
      this.attempts.delete(identifier);
      return false;
    }

    return record.blocked;
  }

  recordAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (success) {
      // Limpiar en éxito
      this.attempts.delete(identifier);
      return;
    }

    if (!record || (now - record.lastAttempt) > this.windowMs) {
      // Nuevo record o ventana expirada
      this.attempts.set(identifier, {
        count: 1,
        lastAttempt: now,
        blocked: false,
      });
    } else {
      // Incrementar contador
      record.count++;
      record.lastAttempt = now;
      
      if (record.count >= this.maxAttempts) {
        record.blocked = true;
      }
    }
  }

  getBlockTimeRemaining(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || !record.blocked) return 0;

    const now = Date.now();
    const timeRemaining = this.blockDurationMs - (now - record.lastAttempt);
    return Math.max(0, timeRemaining);
  }
}

export const loginRateLimiter = new RateLimiter(5, 60000, 900000); // 5 intentos, 1 min ventana, 15 min bloqueo
