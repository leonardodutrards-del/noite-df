import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

export type PipelineStage =
  | 'uncontacted'
  | 'contacted'
  | 'replied'
  | 'trial'
  | 'partner'
  | 'paused'
  | 'lost';

export type PipelineRecord = {
  establishmentId: string;
  stage: PipelineStage;
  contactChannel?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialPlanCode?: 'pro' | 'premium' | 'enterprise';
  subscriptionConsentAt?: string;
  updatedAt: string;
};

type PipelineRow = {
  establishment_id: string;
  stage: PipelineStage;
  contact_channel: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_plan_code: PipelineRecord['trialPlanCode'] | null;
  subscription_consent_at: string | null;
  updated_at: string;
};

function mapRow(row: PipelineRow): PipelineRecord {
  return {
    establishmentId: row.establishment_id,
    stage: row.stage,
    contactChannel: row.contact_channel ?? undefined,
    lastContactAt: row.last_contact_at ?? undefined,
    nextFollowUpAt: row.next_follow_up_at ?? undefined,
    notes: row.notes ?? undefined,
    trialStartedAt: row.trial_started_at ?? undefined,
    trialEndsAt: row.trial_ends_at ?? undefined,
    trialPlanCode: row.trial_plan_code ?? undefined,
    subscriptionConsentAt: row.subscription_consent_at ?? undefined,
    updatedAt: row.updated_at,
  };
}

export async function listPipeline(): Promise<PipelineRecord[]> {
  const rows = await supabaseAdminJson<PipelineRow[]>(
    'partner_pipeline?select=*&order=updated_at.desc'
  );
  return rows.map(mapRow);
}

export async function updatePipeline(input: {
  establishmentId: string;
  stage: PipelineStage;
  contactChannel?: string;
  notes?: string;
  nextFollowUpAt?: string | null;
  trialPlanCode?: 'pro' | 'premium' | 'enterprise';
  subscriptionConsent?: boolean;
}): Promise<PipelineRecord> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    stage: input.stage,
    contact_channel: input.contactChannel ?? null,
    notes: input.notes ?? null,
    next_follow_up_at: input.nextFollowUpAt ?? null,
    updated_at: now,
  };

  if (input.stage === 'contacted' || input.stage === 'replied') patch.last_contact_at = now;
  if (input.stage === 'trial') {
    patch.trial_started_at = now;
    patch.trial_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    patch.trial_plan_code = input.trialPlanCode ?? 'pro';
  }
  if (input.subscriptionConsent) patch.subscription_consent_at = now;

  const response = await supabaseAdminRequest(
    `partner_pipeline?establishment_id=eq.${encodeURIComponent(input.establishmentId)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    }
  );
  if (!response.ok) throw new Error('PIPELINE_UPDATE_FAILED');
  const rows = (await response.json()) as PipelineRow[];
  if (!rows[0]) throw new Error('PIPELINE_RECORD_NOT_FOUND');
  return mapRow(rows[0]);
}
