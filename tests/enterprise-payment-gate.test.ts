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
it('activates only after authorization and records the provider free-period end without restarting on renewal', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://db.example.test');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test');
  let started = false;
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (!init?.method) {
      if (url.includes('payment_provider_plans')) return new Response(JSON.stringify([{ establishment_id: 'contexto-bar' }]));
      if (url.includes('subscription_accounts')) return new Response(JSON.stringify(started ? [{ id: 'row', current_period_end: '2099-11-13T12:00:00Z' }] : []));
      if (url.includes('partner_pipeline')) return new Response(JSON.stringify([{ trial_started_at: started ? '2099-10-13T12:00:00Z' : null }]));
    }
    if (init?.method === 'PATCH' && url.includes('trial_started_at=is.null')) started = true;
    return new Response(null, { status: 204 });
  });
  vi.stubGlobal('fetch', fetch);
  const resource = { id: 'subscription', status: 'authorized', external_reference: 'noite-df:contexto-bar:enterprise', preapproval_plan_id: 'promo-plan', card_id: 'confirmed-card', payment_method_id: 'visa', next_payment_date: '2099-11-13T12:00:00Z', auto_recurring: { transaction_amount: 150 } };
  await syncSubscriptionResource(resource);
  await syncSubscriptionResource({ ...resource, next_payment_date: '2099-12-13T12:00:00Z' });
  const trialWrites = fetch.mock.calls.filter(([url, init]) => init?.method === 'PATCH' && url.includes('trial_started_at=is.null'));
  expect(trialWrites).toHaveLength(1);
  expect(JSON.parse(String(trialWrites[0][1]?.body))).toMatchObject({ trial_ends_at: '2099-11-13T12:00:00Z', trial_plan_code: 'enterprise' });
  const creation = fetch.mock.calls.find(([url, init]) => init?.method === 'POST' && url.includes('subscription_accounts'));
  expect(JSON.parse(String(creation?.[1]?.body))).toMatchObject({ status: 'active', amount_cents: 15000, plan_code: 'enterprise' });
});
