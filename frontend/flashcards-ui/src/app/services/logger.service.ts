import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
  };

  private currentLevel: number;

  constructor() {
    const envLevel = typeof process !== 'undefined' ? (process.env['LOG_LEVEL'] as string) : undefined;
    const level = (envLevel || (environment as any).logLevel) as LogLevel;
    this.currentLevel = this.levels[level] ?? this.levels.info;
  }

  debug(...args: unknown[]) {
    if (this.currentLevel <= this.levels.debug) {
      console.debug(...args);
    }
  }

  info(...args: unknown[]) {
    if (this.currentLevel <= this.levels.info) {
      console.info(...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.currentLevel <= this.levels.warn) {
      console.warn(...args);
    }
  }

  error(...args: unknown[]) {
    if (this.currentLevel <= this.levels.error) {
      console.error(...args);
    }
  }
}
