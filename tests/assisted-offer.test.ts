import { describe, expect, it } from 'vitest';
import { ASSISTED_OFFER, programmingContactUrl } from '@/lib/assisted-offer';
import { PLAN_CATALOG } from '@/lib/plans';
describe('assisted publication offer', () => {
  it('defines a bounded R$30 service without rewriting legacy prices', () => {
    expect(ASSISTED_OFFER.priceCents).toBe(3000);
    expect(ASSISTED_OFFER.updatesPerMonth).toBe(4);
    expect(PLAN_CATALOG.enterprise.priceCents).toBe(15000);
  });
  it('opens WhatsApp with the public phone authorized by the founder', () => {
    expect(programmingContactUrl).toMatch(/^https:\/\/wa.me\/5561981347423\?text=/);
    expect(ASSISTED_OFFER.phoneLabel).toBe('(61) 98134-7423');
    expect(decodeURIComponent(programmingContactUrl)).toContain('confirmar o cadastro existente');
  });
});
