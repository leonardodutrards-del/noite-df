import { authService } from '@/modules/auth/service';
import type { AuthUser } from '@/modules/auth/types';
import type { SubscriptionAccount } from './types';

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
    return Array.from(this.payments.values());
  }

  async getById(paymentId: string, actor: AuthUser): Promise<SubscriptionAccount | null> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }
    const item = this.payments.get(paymentId);
    return item ? { ...item } : null;
  }

  async refund(paymentId: string, reason: string, actor: AuthUser): Promise<SubscriptionAccount> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    if (payment.status === 'refunded') {
      throw new Error('PAYMENT_ALREADY_REFUNDED');
    }

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
  }
}

export const paymentAdminService = new PaymentAdminService();
