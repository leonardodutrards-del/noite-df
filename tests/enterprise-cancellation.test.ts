import { NextRequest } from 'next/server';
import { afterEach, expect, it, vi } from 'vitest';
import { DELETE } from '../app/api/parceiro/billing/route';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), json: vi.fn(), request: vi.fn(), sync: vi.fn() }));
vi.mock('../modules/auth/session', () => ({ requireAuth: mocks.auth }));
vi.mock('../lib/supabase-admin', () => ({ supabaseAdminJson: mocks.json, supabaseAdminRequest: mocks.request }));
vi.mock('../lib/mercado-pago', () => ({ syncSubscriptionResource: mocks.sync, mercadoPagoGet: vi.fn(), syncPaymentResource: vi.fn() }));
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function setup() {
  vi.stubEnv('MERCADO_PAGO_ACCESS_TOKEN', 'test-token');
  mocks.auth.mockResolvedValue({ role: 'partner', establishmentId: 'contexto-bar' });
  mocks.json.mockResolvedValue([{ id: 'row', plan_code: 'enterprise', status: 'active', provider_subscription_id: 'subscription', amount_cents: 15000, current_period_end: '2099-11-13T12:00:00Z' }]);
  mocks.request.mockResolvedValue(new Response(null, { status: 204 }));
}
it('cancels hosted promotional checkout without an external reference and preserves the free period', async () => {
  setup();
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'subscription', status: 'canceled', preapproval_plan_id: 'promo-plan', auto_recurring: { transaction_amount: 150 } })));
  vi.stubGlobal('fetch', fetch);
  const result = await DELETE(new NextRequest('https://www.noitedf.com.br/api/parceiro/billing?establishmentId=other'));
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ cancelled: true, accessUntil: '2099-11-13T12:00:00Z' });
  expect(mocks.sync).toHaveBeenCalledWith(expect.objectContaining({ external_reference: 'noite-df:contexto-bar:enterprise', preapproval_plan_id: 'promo-plan', status: 'canceled' }));
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ status: 'canceled' });
});
it('does not mark cancelled or grant access when the provider refuses cancellation', async () => {
  setup();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 502 })));
  const result = await DELETE(new NextRequest('https://www.noitedf.com.br/api/parceiro/billing'));
  expect(result.status).toBe(502);
  expect(mocks.sync).not.toHaveBeenCalled();
  expect(mocks.request).not.toHaveBeenCalled();
});
