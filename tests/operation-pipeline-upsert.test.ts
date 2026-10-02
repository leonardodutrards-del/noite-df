import { describe, expect, it, vi } from 'vitest';

const request = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase-admin', () => ({ supabaseAdminRequest: request }));

import { updatePipeline } from '@/modules/operations/pipeline';

describe('operation pipeline', () => {
  it('creates a follow-up for a recently added establishment without erasing existing notes on a stage change', async () => {
    request.mockResolvedValueOnce({ ok: true, json: async () => [{
      establishment_id: 'new-place', stage: 'replied', contact_channel: 'email',
      notes: 'Retornar na terça', last_contact_at: null, next_follow_up_at: null,
      trial_started_at: null, trial_ends_at: null, trial_plan_code: null,
      subscription_consent_at: null, updated_at: '2026-09-27T12:00:00Z',
    }] });
    const result = await updatePipeline({ establishmentId: 'new-place', stage: 'replied' });
    const [path, options] = request.mock.calls[0];
    expect(path).toContain('on_conflict=establishment_id');
    expect(options.method).toBe('POST');
    const payload = JSON.parse(options.body);
    expect(payload).toMatchObject({ establishment_id: 'new-place', stage: 'replied' });
    expect(payload).not.toHaveProperty('notes');
    expect(payload).not.toHaveProperty('contact_channel');
    expect(payload).not.toHaveProperty('last_contact_at');
    expect(result.notes).toBe('Retornar na terça');
  });
});
