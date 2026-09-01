export type PlanCode = 'pro' | 'premium' | 'enterprise';
export type PaymentStatus = 'active' | 'pending' | 'cancelled' | 'refunded';

export interface SubscriptionAccount {
  id: string;
  establishmentId?: string;
  establishmentName?: string;
  planCode: PlanCode;
  provider: 'mercado_pago';
  providerSubscriptionId?: string;
  payerEmail: string;
  status: PaymentStatus;
  amountCents: number;
  currentPeriodEnd?: string;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundInput {
  paymentId: string;
  reason: string;
}
