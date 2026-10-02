import {
  PLAN_CAPABILITIES,
  PLAN_RANK,
  isPaidPlan,
  type PlanCapability,
  type PlanCode,
} from '@/lib/plans';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

type SubscriptionRow = {
  id: string;
  establishment_id: string | null;
  plan_code: string;
  status: string;
  current_period_end: string | null;
  updated_at: string;
};

type TrialRow = {
  establishment_id: string;
  stage: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_plan_code: string | null;
};

export type EntitlementSource = 'free' | 'trial' | 'subscription' | 'admin';

export type PartnerEntitlements = {
  establishmentId: string;
  planCode: PlanCode;
  source: EntitlementSource;
  capabilities: PlanCapability[];
  activeUntil?: string;
  subscriptionStatus?: string;
};

function isFuture(value: string | null | undefined, now: number): boolean {
  if (!value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && parsed > now;
}

function subscriptionIsEntitled(row: SubscriptionRow, now: number): boolean {
  if (row.status === 'active') {
    return !row.current_period_end || isFuture(row.current_period_end, now);
  }
  if (row.status === 'cancelled') {
    return isFuture(row.current_period_end, now);
  }
  return false;
}

function freeEntitlements(establishmentId: string): PartnerEntitlements {
  return {
    establishmentId,
    planCode: 'free',
    source: 'free',
    capabilities: PLAN_CAPABILITIES.free,
  };
}

export function adminEntitlements(establishmentId: string): PartnerEntitlements {
  return {
    establishmentId,
    planCode: 'enterprise',
    source: 'admin',
    capabilities: PLAN_CAPABILITIES.enterprise,
  };
}

export function hasCapability(
  entitlements: PartnerEntitlements,
  capability: PlanCapability
): boolean {
  return entitlements.capabilities.includes(capability);
}

export async function getEstablishmentEntitlements(
  establishmentId: string
): Promise<PartnerEntitlements> {
  const now = Date.now();
  const subscriptionRows = await supabaseAdminJson<SubscriptionRow[]>(
    `subscription_accounts?establishment_id=eq.${encodeURIComponent(establishmentId)}&select=id,establishment_id,plan_code,status,current_period_end,updated_at&order=updated_at.desc`
  );

  const entitledSubscriptions = subscriptionRows
    .filter((row) => isPaidPlan(row.plan_code) && subscriptionIsEntitled(row, now))
    .sort((left, right) => {
      const planDiff =
        PLAN_RANK[right.plan_code as PlanCode] - PLAN_RANK[left.plan_code as PlanCode];
      if (planDiff !== 0) return planDiff;
      return right.updated_at.localeCompare(left.updated_at);
    });

  const subscription = entitledSubscriptions[0];
  if (subscription && isPaidPlan(subscription.plan_code)) {
    const planCode = subscription.plan_code;
    return {
      establishmentId,
      planCode,
      source: 'subscription',
      capabilities: PLAN_CAPABILITIES[planCode],
      activeUntil: subscription.current_period_end ?? undefined,
      subscriptionStatus: subscription.status,
    };
  }

  const trials = await supabaseAdminJson<TrialRow[]>(
    `partner_pipeline?establishment_id=eq.${encodeURIComponent(establishmentId)}&select=establishment_id,stage,trial_started_at,trial_ends_at,trial_plan_code&limit=1`
  );
  const trial = trials[0];
  if (
    trial?.stage === 'trial' &&
    isPaidPlan(trial.trial_plan_code ?? undefined) &&
    isFuture(trial.trial_ends_at, now)
  ) {
    const planCode = trial.trial_plan_code as Exclude<PlanCode, 'free'>;
    return {
      establishmentId,
      planCode,
      source: 'trial',
      capabilities: PLAN_CAPABILITIES[planCode],
      activeUntil: trial.trial_ends_at ?? undefined,
    };
  }

  return freeEntitlements(establishmentId);
}

export async function startTrialForEstablishment(args: {
  establishmentId: string;
  planCode: Exclude<PlanCode, 'free'>;
  days: number;
}): Promise<PartnerEntitlements> {
  const current = await getEstablishmentEntitlements(args.establishmentId);
  if (current.source === 'subscription') {
    throw new Error('SUBSCRIPTION_ALREADY_ACTIVE');
  }

  const existing = await supabaseAdminJson<TrialRow[]>(
    `partner_pipeline?establishment_id=eq.${encodeURIComponent(args.establishmentId)}&select=establishment_id,stage,trial_started_at,trial_ends_at,trial_plan_code&limit=1`
  );
  if (existing[0]?.trial_started_at) {
    throw new Error('TRIAL_ALREADY_USED');
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + args.days * 24 * 60 * 60 * 1000);
  const payload = {
    establishment_id: args.establishmentId,
    stage: 'trial',
    trial_started_at: startedAt.toISOString(),
    trial_ends_at: endsAt.toISOString(),
    trial_plan_code: args.planCode,
    updated_at: startedAt.toISOString(),
  };

  let response: Response;
  if (existing.length > 0) {
    response = await supabaseAdminRequest(
      `partner_pipeline?establishment_id=eq.${encodeURIComponent(args.establishmentId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      }
    );
  } else {
    response = await supabaseAdminRequest('partner_pipeline', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) throw new Error('TRIAL_PERSIST_FAILED');
  return getEstablishmentEntitlements(args.establishmentId);
}
