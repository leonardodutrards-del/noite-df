import { afterEach, expect, it, vi } from 'vitest';
import { syncSubscriptionResource } from '../lib/mercado-pago';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('does not grant a promotional subscription without provider-confirmed payment method', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://db.example.test');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test');
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ establishment_id: 'contexto-bar' }])));
  vi.stubGlobal('fetch', fetch);
  await expect(syncSubscriptionResource({ id: 'subscription', status: 'authorized', external_reference: 'noite-df:contexto-bar:enterprise:123', preapproval_plan_id: 'plan', next_payment_date: '2099-11-13T12:00:00Z', auto_recurring: { transaction_amount: 150 } })).rejects.toThrow('PAYMENT_METHOD_NOT_CONFIRMED');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][1]?.method).toBeUndefined();
});
it('rejects a forged establishment reference on a mapped promotion', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://db.example.test');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{ establishment_id: 'contexto-bar' }]))));
  await expect(syncSubscriptionResource({ id: 'subscription', status: 'authorized', external_reference: 'noite-df:other:enterprise:123', preapproval_plan_id: 'plan' })).rejects.toThrow('REFERENCE_MISMATCH');
});
