let debug = false;

// Determine debug mode from environment variables
try {
  if (typeof Deno !== 'undefined') {
    const envVal = Deno.env.get('DEBUG');
    if (envVal) {
      debug = ['1', 'true', 'yes'].includes(envVal.toLowerCase());
    }
  }
} catch {
  // Ignore if env access not allowed
}

if (!debug && typeof process !== 'undefined' && process.env.DEBUG) {
  debug = ['1', 'true', 'yes'].includes(process.env.DEBUG.toLowerCase());
}

export function setDebug(value: boolean): void {
  debug = value;
}

export function log(...args: unknown[]): void {
  if (debug) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}
