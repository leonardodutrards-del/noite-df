import crypto from 'crypto';
import { authService } from '@/modules/auth/service';
import type { AuthUser } from '@/modules/auth/types';
import type { CreateEstablishmentInput } from '@/modules/establishments/types';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export type PartnerClaim = {
  id: string;
  establishmentId: string;
  requesterId: string;
  evidence: Record<string, unknown>;
  status: ClaimStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
};

const memoryClaims = new Map<string, PartnerClaim>();

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function rest(path: string, init: RequestInit = {}) {
  const cfg = config();
  if (!cfg) throw new Error('SUPABASE_NOT_CONFIGURED');
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

function rowToClaim(row: Record<string, unknown>): PartnerClaim {
  return {
    id: String(row.id),
    establishmentId: String(row.establishment_id),
    requesterId: String(row.requester_id),
    evidence: (row.evidence as Record<string, unknown>) ?? {},
    status: row.status as ClaimStatus,
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    createdAt: String(row.created_at),
  };
}

export class PartnershipService {
  async createClaim(requester: AuthUser, input: CreateEstablishmentInput): Promise<PartnerClaim> {
    if (requester.role !== 'visitor') {
      throw new Error('FORBIDDEN_VISITOR_REQUIRED');
    }

    const establishmentId = slugify(input.name);
    const now = new Date().toISOString();
    const evidence = {
      submittedName: input.name,
      type: input.type,
      region: input.region,
      address: input.address,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      instagram: input.instagram ?? null,
      website: input.website ?? null,
      submittedAt: now,
    };

    const cfg = config();
    if (!cfg) {
      const claim: PartnerClaim = {
        id: `claim_${crypto.randomUUID()}`,
        establishmentId,
        requesterId: requester.id,
        evidence,
        status: 'pending',
        createdAt: now,
      };
      memoryClaims.set(claim.id, claim);
      return claim;
    }

    const existing = await rest(
      `establishments?id=eq.${encodeURIComponent(establishmentId)}&select=id`
    );
    if (!existing.ok) throw new Error('CLAIM_ESTABLISHMENT_LOOKUP_FAILED');
    const existingRows = (await existing.json()) as Array<{ id: string }>;

    if (existingRows.length === 0) {
      const created = await rest('establishments', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id: establishmentId,
          slug: establishmentId,
          name: input.name,
          type: input.type,
          description: input.description || '',
          region: input.region,
          address: input.address,
          phone: input.phone ?? null,
          whatsapp: input.whatsapp ?? null,
          instagram: input.instagram ?? null,
          website: input.website ?? null,
          publication_status: 'pending_review',
          owner_managed: false,
          maps_query: `${input.name} ${input.address} DF`,
          created_at: now,
          updated_at: now,
        }),
      });
      if (!created.ok) throw new Error('CLAIM_ESTABLISHMENT_CREATE_FAILED');
    }

    const duplicate = await rest(
      `partner_claims?requester_id=eq.${encodeURIComponent(requester.id)}&establishment_id=eq.${encodeURIComponent(establishmentId)}&status=eq.pending&select=id`
    );
    if (!duplicate.ok) throw new Error('CLAIM_DUPLICATE_CHECK_FAILED');
    const duplicates = (await duplicate.json()) as Array<{ id: string }>;
    if (duplicates.length > 0) throw new Error('CLAIM_ALREADY_PENDING');

    const response = await rest('partner_claims', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        establishment_id: establishmentId,
        requester_id: requester.id,
        evidence,
        status: 'pending',
        created_at: now,
      }),
    });
    if (!response.ok) throw new Error('CLAIM_CREATE_FAILED');
    const rows = (await response.json()) as Record<string, unknown>[];
    return rowToClaim(rows[0]);
  }

  async listClaims(actor: AuthUser): Promise<PartnerClaim[]> {
    if (actor.role !== 'admin') throw new Error('FORBIDDEN_ADMIN_REQUIRED');

    if (!config()) {
      return Array.from(memoryClaims.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
    }

    const response = await rest('partner_claims?select=*&order=created_at.desc');
    if (!response.ok) throw new Error('CLAIM_LIST_FAILED');
    const rows = (await response.json()) as Record<string, unknown>[];
    return rows.map(rowToClaim);
  }

  async reviewClaim(
    claimId: string,
    decision: 'approved' | 'rejected',
    actor: AuthUser,
    reason?: string
  ): Promise<PartnerClaim> {
    if (actor.role !== 'admin') throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    const now = new Date().toISOString();

    if (!config()) {
      const claim = memoryClaims.get(claimId);
      if (!claim) throw new Error('CLAIM_NOT_FOUND');
      if (claim.status !== 'pending') throw new Error('CLAIM_ALREADY_REVIEWED');

      claim.status = decision;
      claim.reviewedBy = actor.id;
      claim.reviewedAt = now;

      if (decision === 'approved') {
        await authService.convertToPartner(
          claim.requesterId,
          claim.establishmentId,
          String(claim.evidence.submittedName ?? claim.establishmentId)
        );
      }

      await authService.logAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: `partner_claim_${decision}`,
        entityType: 'partner_claim',
        entityId: claimId,
        details: { reason: reason ?? null, establishmentId: claim.establishmentId },
      });
      return { ...claim };
    }

    const lookup = await rest(
      `partner_claims?id=eq.${encodeURIComponent(claimId)}&select=*`
    );
    if (!lookup.ok) throw new Error('CLAIM_LOOKUP_FAILED');
    const rows = (await lookup.json()) as Record<string, unknown>[];
    if (rows.length === 0) throw new Error('CLAIM_NOT_FOUND');
    const claim = rowToClaim(rows[0]);
    if (claim.status !== 'pending') throw new Error('CLAIM_ALREADY_REVIEWED');

    const reviewed = await rest(`partner_claims?id=eq.${encodeURIComponent(claimId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        status: decision,
        reviewed_by: actor.id,
        reviewed_at: now,
        evidence: { ...claim.evidence, reviewReason: reason ?? null },
      }),
    });
    if (!reviewed.ok) throw new Error('CLAIM_REVIEW_FAILED');

    if (decision === 'approved') {
      const profileUpdate = await rest(
        `profiles?id=eq.${encodeURIComponent(claim.requesterId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            role: 'partner',
            establishment_id: claim.establishmentId,
            updated_at: now,
          }),
        }
      );
      if (!profileUpdate.ok) throw new Error('CLAIM_PROFILE_UPDATE_FAILED');

      const establishmentUpdate = await rest(
        `establishments?id=eq.${encodeURIComponent(claim.establishmentId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ owner_managed: true, updated_at: now }),
        }
      );
      if (!establishmentUpdate.ok) throw new Error('CLAIM_ESTABLISHMENT_UPDATE_FAILED');
    }

    await authService.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: `partner_claim_${decision}`,
      entityType: 'partner_claim',
      entityId: claimId,
      details: {
        reason: reason ?? null,
        requesterId: claim.requesterId,
        establishmentId: claim.establishmentId,
      },
    });

    const reviewedRows = (await reviewed.json()) as Record<string, unknown>[];
    return rowToClaim(reviewedRows[0]);
  }
}

export const partnershipService = new PartnershipService();
