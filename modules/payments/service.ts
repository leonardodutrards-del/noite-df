import { authService } from '@/modules/auth/service';
import type { AuthUser } from '@/modules/auth/types';
import type { SubscriptionAccount } from './types';
import { mercadoPagoRefund } from '@/lib/mercado-pago';

const DEFAULT_PAYMENTS: SubscriptionAccount[] = [
  {
    id: 'sub_five_1',
    establishmentId: 'five-sport-bar',
    establishmentName: 'Five Sport Bar',
    planCode: 'pro',
    provider: 'mercado_pago',
    providerSubscriptionId: 'mp_sub_998182',
    payerEmail: 'financeiro@fivebar.com.br',
    status: 'active',
    amountCents: 9990,
    currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  {
    id: 'sub_pinella_1',
    establishmentId: 'pinella',
    establishmentName: 'Pinella',
    planCode: 'premium',
    provider: 'mercado_pago',
    providerSubscriptionId: 'mp_sub_998183',
    payerEmail: 'contato@pinella.com.br',
    status: 'active',
    amountCents: 24990,
    currentPeriodEnd: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-08-05T15:30:00.000Z',
    updatedAt: '2026-08-05T15:30:00.000Z',
  },
  {
    id: 'sub_ticiana_1',
    establishmentId: 'ticiana-werner-wine-bar',
    establishmentName: 'Ticiana Werner Wine Bar',
    planCode: 'enterprise',
    provider: 'mercado_pago',
    providerSubscriptionId: 'mp_sub_998184',
    payerEmail: 'eventos@ticianawerner.com.br',
    status: 'active',
    amountCents: 150000,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-08-10T09:15:00.000Z',
    updatedAt: '2026-08-10T09:15:00.000Z',
  },
];

function productionConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return process.env.NODE_ENV !== 'test' && url && key ? { url, key } : null;
}

function rowToSubscription(row: Record<string, unknown>): SubscriptionAccount {
  return {
    id: String(row.id),
    establishmentId: row.establishment_id ? String(row.establishment_id) : undefined,
    planCode: row.plan_code as SubscriptionAccount['planCode'],
    provider: 'mercado_pago',
    providerSubscriptionId: row.provider_subscription_id ? String(row.provider_subscription_id) : undefined,
    providerPaymentId: row.provider_payment_id ? String(row.provider_payment_id) : undefined,
    payerEmail: String(row.payer_email ?? ''),
    status: row.status as SubscriptionAccount['status'],
    amountCents: Number(row.amount_cents ?? 0),
    currentPeriodEnd: row.current_period_end ? String(row.current_period_end) : undefined,
    refundedAt: row.refunded_at ? String(row.refunded_at) : undefined,
    refundReason: row.refund_reason ? String(row.refund_reason) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function supabasePaymentRequest(path: string, init: RequestInit = {}) {
  const cfg = productionConfig();
  if (!cfg) throw new Error('PAYMENT_PERSISTENCE_NOT_CONFIGURED');
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}

class PaymentAdminService {
  private payments: Map<string, SubscriptionAccount> = new Map();

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    this.payments.clear();
    for (const item of DEFAULT_PAYMENTS) {
      this.payments.set(item.id, { ...item });
    }
  }

  async listAll(actor: AuthUser): Promise<SubscriptionAccount[]> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }
    if (productionConfig()) {
      const response = await supabasePaymentRequest(
        'subscription_accounts?select=*&order=created_at.desc'
      );
      if (!response.ok) throw new Error('PAYMENT_LIST_FAILED');
      const rows = (await response.json()) as Record<string, unknown>[];
      return rows.map(rowToSubscription);
    }
    return Array.from(this.payments.values());
  }

  async getById(paymentId: string, actor: AuthUser): Promise<SubscriptionAccount | null> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }
    if (productionConfig()) {
      const response = await supabasePaymentRequest(
        `subscription_accounts?id=eq.${encodeURIComponent(paymentId)}&select=*`
      );
      if (!response.ok) throw new Error('PAYMENT_LOOKUP_FAILED');
      const rows = (await response.json()) as Record<string, unknown>[];
      return rows[0] ? rowToSubscription(rows[0]) : null;
    }
    const item = this.payments.get(paymentId);
    return item ? { ...item } : null;
  }

  async refund(paymentId: string, reason: string, actor: AuthUser): Promise<SubscriptionAccount> {
    if (actor.role !== 'admin') throw new Error('FORBIDDEN_ADMIN_REQUIRED');

    if (productionConfig()) {
      const payment = await this.getById(paymentId, actor);
      if (!payment) throw new Error('PAYMENT_NOT_FOUND');
      if (payment.status === 'refunded') throw new Error('PAYMENT_ALREADY_REFUNDED');
      if (!payment.providerPaymentId) throw new Error('PROVIDER_PAYMENT_ID_MISSING');

      await mercadoPagoRefund(
        payment.providerPaymentId,
        `noite-df-refund-${payment.id}`
      );

      const now = new Date().toISOString();
      const response = await supabasePaymentRequest(
        `subscription_accounts?id=eq.${encodeURIComponent(payment.id)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            status: 'refunded',
            refunded_at: now,
            refund_reason: reason || 'Reembolso autorizado pelo Administrador Master.',
            updated_at: now,
          }),
        }
      );
      if (!response.ok) throw new Error('PAYMENT_REFUND_PERSIST_FAILED');
      const rows = (await response.json()) as Record<string, unknown>[];
      const updated = rowToSubscription(rows[0]);

      await authService.logAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: 'refund_payment',
        entityType: 'payment',
        entityId: paymentId,
        beforeData: payment as unknown as Record<string, unknown>,
        afterData: updated as unknown as Record<string, unknown>,
        details: { reason: updated.refundReason, providerPaymentId: payment.providerPaymentId },
      });
      return updated;
    }

    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    if (payment.status === 'refunded') throw new Error('PAYMENT_ALREADY_REFUNDED');

    const before = { ...payment };
    const now = new Date().toISOString();
    const updated: SubscriptionAccount = {
      ...payment,
      status: 'refunded',
      refundedAt: now,
      refundReason: reason || 'Reembolso autorizado pelo Administrador Master.',
      updatedAt: now,
    };
    this.payments.set(paymentId, updated);
    await authService.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'refund_payment',
      entityType: 'payment',
      entityId: paymentId,
      beforeData: before as unknown as Record<string, unknown>,
      afterData: updated as unknown as Record<string, unknown>,
      details: {
        reason: updated.refundReason,
        amountCents: updated.amountCents,
        establishmentId: updated.establishmentId,
        establishmentName: updated.establishmentName,
      },
    });
    return updated;
  }}

export const paymentAdminService = new PaymentAdminService();
