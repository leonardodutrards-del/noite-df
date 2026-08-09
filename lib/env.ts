export function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (typeof value !== 'string') return defaultValue;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

export const SHOWCASE_MODE = parseBoolean(process.env.SHOWCASE_MODE, true);
export const PAYMENTS_ENABLED = parseBoolean(process.env.PAYMENTS_ENABLED, false);
