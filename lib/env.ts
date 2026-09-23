export function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (typeof value !== 'string') return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export const SHOWCASE_MODE = parseBoolean(process.env.SHOWCASE_MODE, true);
export const PAYMENTS_ENABLED = parseBoolean(process.env.PAYMENTS_ENABLED, false);
export const TRIAL_ENABLED = parseBoolean(process.env.TRIAL_ENABLED, false);
export const TRIAL_DAYS = Math.min(Math.max(Number(process.env.TRIAL_DAYS || 30) || 30, 1), 90);
