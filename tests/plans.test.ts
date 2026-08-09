import { describe, expect, it } from 'vitest';
import { PLAN_CATALOG, getPlan, formatMoney, isPaidPlan } from '@/lib/plans';

describe('plan catalog', () => {
  it('contains the expected plans with correct cent values', () => {
    expect(PLAN_CATALOG.free.priceCents).toBe(0);
    expect(PLAN_CATALOG.pro.priceCents).toBe(5990);
    expect(PLAN_CATALOG.premium.priceCents).toBe(9990);
    expect(PLAN_CATALOG.enterprise.priceCents).toBe(15000);
  });

  it('formats money in pt-BR with centavos', () => {
    expect(formatMoney(0)).toBe('R$ 0,00');
    expect(formatMoney(5990)).toBe('R$ 59,90');
    expect(formatMoney(15000)).toBe('R$ 150,00');
  });

  it('returns undefined for invalid plan ids and validates paid plans', () => {
    expect(getPlan('invalid')).toBeUndefined();
    expect(isPaidPlan('free')).toBe(false);
    expect(isPaidPlan('pro')).toBe(true);
  });
});
