import { describe, expect, it } from 'vitest';
import { parseBoolean } from '@/lib/env';

describe('environment parsing', () => {
  it('parses true and false correctly', () => {
    expect(parseBoolean('true', false)).toBe(true);
    expect(parseBoolean('false', true)).toBe(false);
  });

  it('returns default for missing values', () => {
    expect(parseBoolean(undefined, true)).toBe(true);
    expect(parseBoolean(undefined, false)).toBe(false);
  });

  it('returns default for invalid values', () => {
    expect(parseBoolean('yes', false)).toBe(false);
    expect(parseBoolean('no', true)).toBe(true);
  });
});
