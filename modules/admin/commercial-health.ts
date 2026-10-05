import { PAYMENTS_ENABLED, SHOWCASE_MODE } from '@/lib/env';
import { supabaseAdminJson } from '@/lib/supabase-admin';

type EstablishmentRow = {
  id: string;
  name: string;
  region: string;
};

type PipelineRow = {
  establishment_id: string;
  stage: string;
  visit_status: string | null;
  next_follow_up_at: string | null;
  visit_notes: string | null;
  updated_at: string;
};

type CheckoutRow = {
  id: number;
  establishment_id: string | null;
  created_at: string;
};

type WebhookRow = {
  id: string;
  event_type: string;
  processed_at: string | null;
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  establishment_id: string | null;
  status: string;
  amount_cents: number | null;
  updated_at: string;
};

export type CommercialHealth = {
  generatedAt: string;
  readiness: {
    paymentsEnabled: boolean;
    showcaseDisabled: boolean;
    mercadoPagoConfigured: boolean;
    webhookSecretConfigured: boolean;
    productionUrlConfigured: boolean;
    environmentReady: boolean;
  };
  firstPayment: {
    state: 'ready' | 'checkout_started' | 'webhook_received' | 'active';
    checkoutEvents: number;
    webhookEvents: number;
    subscriptionAccounts: number;
    activeSubscriptions: number;
    latestCheckoutAt?: string;
    latestWebhookAt?: string;
    latestSubscriptionAt?: string;
  };
  sobradinho: {
    establishments: number;
    visited: number;
    interested: number;
    followUps: number;
    dueFollowUps: number;
    trials: number;
    signed: number;
    conversionPercent: number;
  };
  dueFollowUps: Array<{
    establishmentId: string;
    establishmentName: string;
    nextFollowUpAt: string;
    visitNotes?: string;
  }>;
  recentActivity: Array<{
    establishmentId: string;
    establishmentName: string;
    visitStatus: string;
    stage: string;
    updatedAt: string;
  }>;
};

export async function getCommercialHealth(): Promise<CommercialHealth> {
  const now = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? '';

  const [establishments, pipeline, checkouts, webhooks, subscriptions] = await Promise.all([
    supabaseAdminJson<EstablishmentRow[]>(
      'establishments?region=eq.Sobradinho&select=id,name,region&order=name.asc'
    ),
    supabaseAdminJson<PipelineRow[]>(
      'partner_pipeline?select=establishment_id,stage,visit_status,next_follow_up_at,visit_notes,updated_at&order=updated_at.desc'
    ),
    supabaseAdminJson<CheckoutRow[]>(
      'interactions?action=eq.subscription_checkout&select=id,establishment_id,created_at&order=created_at.desc&limit=1000'
    ),
    supabaseAdminJson<WebhookRow[]>(
      'payment_webhook_events?provider=eq.mercado_pago&select=id,event_type,processed_at,created_at&order=created_at.desc&limit=1000'
    ),
    supabaseAdminJson<SubscriptionRow[]>(
      'subscription_accounts?select=id,establishment_id,status,amount_cents,updated_at&order=updated_at.desc&limit=1000'
    ),
  ]);

  const localNames = new Map(establishments.map((row) => [row.id, row.name]));
  const localIds = new Set(localNames.keys());
  const localPipeline = pipeline.filter((row) => localIds.has(row.establishment_id));

  let visited = 0;
  let interested = 0;
  let followUps = 0;
  let dueFollowUpsCount = 0;
  let trials = 0;
  let signed = 0;

  const dueFollowUps: CommercialHealth['dueFollowUps'] = [];

  for (const row of localPipeline) {
    const visitStatus = row.visit_status ?? 'not_visited';
    if (visitStatus !== 'not_visited') visited += 1;
    if (visitStatus === 'interested') interested += 1;
    if (visitStatus === 'follow_up') followUps += 1;
    if (visitStatus === 'trial') trials += 1;
    if (visitStatus === 'signed') signed += 1;

    if (
      row.next_follow_up_at &&
      Date.parse(row.next_follow_up_at) <= now &&
      visitStatus !== 'signed' &&
      visitStatus !== 'lost'
    ) {
      dueFollowUpsCount += 1;
      dueFollowUps.push({
        establishmentId: row.establishment_id,
        establishmentName: localNames.get(row.establishment_id) ?? row.establishment_id,
        nextFollowUpAt: row.next_follow_up_at,
        visitNotes: row.visit_notes ?? undefined,
      });
    }
  }

  dueFollowUps.sort((left, right) => left.nextFollowUpAt.localeCompare(right.nextFollowUpAt));

  const activeSubscriptions = subscriptions.filter((row) => row.status === 'active').length;
  const firstPaymentState: CommercialHealth['firstPayment']['state'] =
    activeSubscriptions > 0
      ? 'active'
      : webhooks.length > 0
        ? 'webhook_received'
        : checkouts.length > 0 || subscriptions.length > 0
          ? 'checkout_started'
          : 'ready';

  const readiness = {
    paymentsEnabled: PAYMENTS_ENABLED,
    showcaseDisabled: !SHOWCASE_MODE,
    mercadoPagoConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
    webhookSecretConfigured: Boolean(process.env.MERCADO_PAGO_WEBHOOK_SECRET),
    productionUrlConfigured:
      appUrl.startsWith('https://') &&
      !appUrl.includes('localhost') &&
      !appUrl.includes('vercel.app'),
    environmentReady: false,
  };
  readiness.environmentReady =
    readiness.paymentsEnabled &&
    readiness.showcaseDisabled &&
    readiness.mercadoPagoConfigured &&
    readiness.webhookSecretConfigured &&
    readiness.productionUrlConfigured;

  return {
    generatedAt: new Date().toISOString(),
    readiness,
    firstPayment: {
      state: firstPaymentState,
      checkoutEvents: checkouts.length,
      webhookEvents: webhooks.length,
      subscriptionAccounts: subscriptions.length,
      activeSubscriptions,
      latestCheckoutAt: checkouts[0]?.created_at,
      latestWebhookAt: webhooks[0]?.processed_at ?? webhooks[0]?.created_at,
      latestSubscriptionAt: subscriptions[0]?.updated_at,
    },
    sobradinho: {
      establishments: establishments.length,
      visited,
      interested,
      followUps,
      dueFollowUps: dueFollowUpsCount,
      trials,
      signed,
      conversionPercent: visited > 0 ? Math.round((signed / visited) * 100) : 0,
    },
    dueFollowUps: dueFollowUps.slice(0, 20),
    recentActivity: localPipeline.slice(0, 8).map((row) => ({
      establishmentId: row.establishment_id,
      establishmentName: localNames.get(row.establishment_id) ?? row.establishment_id,
      visitStatus: row.visit_status ?? 'not_visited',
      stage: row.stage,
      updatedAt: row.updated_at,
    })),
  };
}
