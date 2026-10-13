import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEnterprisePromotionCheckout, validatePromotionPlan } from '../lib/enterprise-promotion';
const mocks = vi.hoisted(() => ({ json: vi.fn(), request: vi.fn(), get: vi.fn() }));
vi.mock('../lib/supabase-admin', () => ({ supabaseAdminJson: mocks.json, supabaseAdminRequest: mocks.request }));
vi.mock('../lib/mercado-pago', () => ({ mercadoPagoGet: mocks.get }));
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });
const plan = { id: 'promo', status: 'active', init_point: 'https://www.mercadopago.com.br/subscriptions/checkout?id=promo', auto_recurring: { transaction_amount: 150, currency_id: 'BRL', free_trial: { frequency: 1, frequency_type: 'months' } } };
describe('Enterprise promotional checkout', () => {
  it('rejects missing free month, wrong price and untrusted checkout', () => {
    expect(() => validatePromotionPlan(plan)).not.toThrow();
    expect(() => validatePromotionPlan({ ...plan, auto_recurring: { transaction_amount: 150, currency_id: 'BRL' } })).toThrow('TERMS_INVALID');
    expect(() => validatePromotionPlan({ ...plan, init_point: 'https://evil.test/' })).toThrow('TERMS_INVALID');
    expect(() => validatePromotionPlan({ ...plan, auto_recurring: { ...plan.auto_recurring, transaction_amount: 160 } })).toThrow('TERMS_INVALID');
  });
  it('rejects new establishments before creating any provider object', async () => {
    await expect(createEnterprisePromotionCheckout('new-place', 'https://www.noitedf.com.br')).rejects.toThrow('NOT_ELIGIBLE');
    expect(mocks.json).not.toHaveBeenCalled();
  });
  it('does not start a trial when opening checkout', async () => {
    mocks.json.mockResolvedValueOnce([{ publication_status: 'published' }]).mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(plan))));
    mocks.request.mockResolvedValue(new Response(null, { status: 201 }));
    expect(await createEnterprisePromotionCheckout('contexto-bar', 'https://www.noitedf.com.br')).toBe(plan.init_point);
    expect(mocks.request).toHaveBeenCalledTimes(1);
    expect(mocks.request.mock.calls[0][0]).toBe('payment_provider_plans');
  });
  it('prevents reused trials and duplicate active billing', async () => {
    mocks.json.mockResolvedValueOnce([{ publication_status: 'published' }]).mockResolvedValueOnce([{ trial_started_at: '2026-10-01' }]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    await expect(createEnterprisePromotionCheckout('contexto-bar', 'https://www.noitedf.com.br')).rejects.toThrow('TRIAL_ALREADY_USED');
    mocks.json.mockResolvedValueOnce([{ publication_status: 'published' }]).mockResolvedValueOnce([]).mockResolvedValueOnce([{ status: 'active', current_period_end: null }]).mockResolvedValueOnce([]);
    await expect(createEnterprisePromotionCheckout('contexto-bar', 'https://www.noitedf.com.br')).rejects.toThrow('SUBSCRIPTION_ALREADY_ACTIVE');
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
