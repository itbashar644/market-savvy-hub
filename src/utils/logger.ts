let debug = false;

// Determine debug mode from environment variables
if (typeof process !== 'undefined' && process.env.DEBUG) {
  debug = ['1', 'true', 'yes'].includes(process.env.DEBUG.toLowerCase());
} else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEBUG) {
  const val = String(import.meta.env.VITE_DEBUG);
  debug = ['1', 'true', 'yes'].includes(val.toLowerCase());
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
