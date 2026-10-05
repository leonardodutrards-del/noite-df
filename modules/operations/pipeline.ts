import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

export type PipelineStage =
  | 'uncontacted'
  | 'contacted'
  | 'replied'
  | 'trial'
  | 'partner'
  | 'paused'
  | 'lost';

export type VisitStatus =
  | 'not_visited'
  | 'visited'
  | 'owner_contacted'
  | 'interested'
  | 'follow_up'
  | 'trial'
  | 'signed'
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
  visitStatus: VisitStatus;
  visitedAt?: string;
  visitNotes?: string;
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
  visit_status: VisitStatus;
  visited_at: string | null;
  visit_notes: string | null;
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
    visitStatus: row.visit_status ?? 'not_visited',
    visitedAt: row.visited_at ?? undefined,
    visitNotes: row.visit_notes ?? undefined,
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
  visitStatus?: VisitStatus;
  visitNotes?: string;
}): Promise<PipelineRecord> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    stage: input.stage,
    updated_at: now,
  };
  if (input.contactChannel !== undefined) patch.contact_channel = input.contactChannel;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.nextFollowUpAt !== undefined) patch.next_follow_up_at = input.nextFollowUpAt;
  if (input.visitNotes !== undefined) patch.visit_notes = input.visitNotes;
  if (input.visitStatus !== undefined) {
    patch.visit_status = input.visitStatus;
    if (input.visitStatus !== 'not_visited') patch.visited_at = now;
  }

  if (input.stage === 'contacted' || input.stage === 'replied') patch.last_contact_at = now;
  if (input.stage === 'trial' && input.trialPlanCode) {
    patch.trial_started_at = now;
    patch.trial_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    patch.trial_plan_code = input.trialPlanCode;
  }
  if (input.subscriptionConsent) patch.subscription_consent_at = now;

  const response = await supabaseAdminRequest(
    'partner_pipeline?on_conflict=establishment_id',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ establishment_id: input.establishmentId, ...patch }),
    }
  );
  if (!response.ok) throw new Error('PIPELINE_UPDATE_FAILED');
  const rows = (await response.json()) as PipelineRow[];
  if (!rows[0]) throw new Error('PIPELINE_UPSERT_FAILED');
  return mapRow(rows[0]);
}
