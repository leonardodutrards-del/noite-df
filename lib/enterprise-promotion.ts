import eligibleIds from '@/data/promotions/enterprise-2026-10-13.json';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';
import { mercadoPagoGet } from '@/lib/mercado-pago';

export const ENTERPRISE_PROMOTION = { id: 'enterprise-2026-10-13', paymentMethod: 'enterprise_trial_20261013', eligibleIds: new Set(eligibleIds) };
type ProviderPlan = { id?: string; status?: string; init_point?: string; auto_recurring?: { transaction_amount?: number; currency_id?: string; free_trial?: { frequency?: number; frequency_type?: string } } };
export function validatePromotionPlan(plan: ProviderPlan) {
  const trial = plan.auto_recurring?.free_trial;
  if (plan.status !== 'active' || trial?.frequency !== 1 || trial.frequency_type !== 'months' || Number(plan.auto_recurring?.transaction_amount) !== 150 || plan.auto_recurring?.currency_id !== 'BRL' || !plan.init_point || !/^https:\/\/www\.mercadopago\.com\.br\//.test(plan.init_point)) throw new Error('PROMOTION_PROVIDER_TERMS_INVALID');
}

export async function createEnterprisePromotionCheckout(establishmentId: string, origin: string) {
  if (!ENTERPRISE_PROMOTION.eligibleIds.has(establishmentId)) throw new Error('PROMOTION_NOT_ELIGIBLE');
  const filter = `establishment_id=eq.${encodeURIComponent(establishmentId)}`;
  const [places, trials, subscriptions, plans] = await Promise.all([
    supabaseAdminJson<Array<{ publication_status: string }>>(`establishments?id=eq.${encodeURIComponent(establishmentId)}&select=publication_status&limit=1`),
    supabaseAdminJson<Array<{ trial_started_at: string | null }>>(`partner_pipeline?${filter}&select=trial_started_at&limit=1`),
    supabaseAdminJson<Array<{ status: string; current_period_end: string | null }>>(`subscription_accounts?${filter}&select=status,current_period_end`),
    supabaseAdminJson<Array<{ provider_plan_id: string }>>(`payment_provider_plans?${filter}&provider=eq.mercado_pago&payment_method=eq.${ENTERPRISE_PROMOTION.paymentMethod}&select=provider_plan_id&limit=1`),
  ]);
  if (!places[0] || places[0].publication_status === 'suspended') throw new Error('PROMOTION_NOT_ELIGIBLE');
  if (trials[0]?.trial_started_at) throw new Error('TRIAL_ALREADY_USED');
  if (subscriptions.some(row => (row.status === 'active' && (!row.current_period_end || Date.parse(row.current_period_end) > Date.now())) || (row.status === 'cancelled' && row.current_period_end && Date.parse(row.current_period_end) > Date.now()))) throw new Error('SUBSCRIPTION_ALREADY_ACTIVE');
  if (plans[0]) {
    const plan = await mercadoPagoGet<ProviderPlan>(`/preapproval_plan/${encodeURIComponent(plans[0].provider_plan_id)}`);
    validatePromotionPlan(plan);
    return plan.init_point!;
  }
  const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Noite DF Enterprise — 1 mês grátis, depois R$ 150/mês', auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: 150, currency_id: 'BRL', free_trial: { frequency: 1, frequency_type: 'months' } }, back_url: `${origin}/pagamento/retorno` }),
  });
  const plan = await response.json() as ProviderPlan;
  if (!response.ok || !plan.id) throw new Error('PROMOTION_CHECKOUT_FAILED');
  validatePromotionPlan(plan);
  const saved = await supabaseAdminRequest('payment_provider_plans', {
    method: 'POST', headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ provider: 'mercado_pago', establishment_id: establishmentId, plan_code: 'enterprise', payment_method: ENTERPRISE_PROMOTION.paymentMethod, provider_plan_id: plan.id, amount_cents: 15000, checkout_url: plan.init_point }),
  });
  if (!saved.ok) throw new Error('PROMOTION_CHECKOUT_PERSIST_FAILED');
  return plan.init_point!;
}
