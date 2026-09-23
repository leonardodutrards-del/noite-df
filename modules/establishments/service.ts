import { authService } from '@/modules/auth/service';
import type { AuthUser } from '@/modules/auth/types';
import type { EstablishmentRepository } from './repository';
import type { CrowdStatus, Establishment, Promotion, WeeklyScheduleItem } from './types';
import { getEstablishmentRepository } from '@/infrastructure/repositories';

export type EstablishmentFilters = {
  query?: string;
  region?: string;
  vibe?: string;
};

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export class EstablishmentService {
  constructor(private readonly repository: EstablishmentRepository = getEstablishmentRepository()) {}

  async search(filters: EstablishmentFilters): Promise<Establishment[]> {
    const establishments = await this.repository.listPublished();
    const query = normalize(filters.query ?? '');

    return establishments.filter((place) => {
      const haystack = normalize([
        place.name,
        place.region,
        place.type,
        place.description,
        ...place.vibe,
        ...place.music,
        ...place.audience,
      ].join(' '));

      const matchesQuery = !query || haystack.includes(query);
      const matchesRegion = !filters.region || filters.region === 'todos' || place.region === filters.region;
      const matchesVibe = !filters.vibe || filters.vibe === 'todas' || place.vibe.some((item) => normalize(item).includes(normalize(filters.vibe!)));

      return matchesQuery && matchesRegion && matchesVibe;
    });
  }

  async listAllForAdmin(actor: AuthUser): Promise<Establishment[]> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }
    return this.repository.listAll();
  }

  async getById(id: string, actor?: AuthUser): Promise<Establishment | null> {
    const establishment = await this.repository.findById(id);
    if (!establishment) return null;

    if (!actor) {
      // Public access: expose only explicitly published records.
      if (establishment.publicationStatus !== 'published') {
        return null;
      }
      return establishment;
    }

    if (actor.role === 'admin') {
      return establishment;
    }

    if (actor.role === 'partner') {
      if (actor.establishmentId !== id) {
        throw new Error('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
      }
      return establishment;
    }

    return establishment;
  }

  async update(id: string, updates: Partial<Establishment>, actor: AuthUser): Promise<Establishment> {
    if (actor.role !== 'admin') {
      if (actor.role !== 'partner' || actor.establishmentId !== id) {
        throw new Error('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
      }
    }

    const before = await this.repository.findById(id);
    if (!before) {
      throw new Error('ESTABLISHMENT_NOT_FOUND');
    }

    // Only admin can change publicationStatus or verified
    const sanitizedUpdates = { ...updates };
    if (actor.role !== 'admin') {
      delete sanitizedUpdates.publicationStatus;
      delete sanitizedUpdates.verified;
      delete sanitizedUpdates.id;
    }

    const updated = await this.repository.update(id, sanitizedUpdates);
    if (!updated) {
      throw new Error('ESTABLISHMENT_UPDATE_FAILED');
    }

    await authService.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'update_establishment',
      entityType: 'establishment',
      entityId: id,
      beforeData: before as unknown as Record<string, unknown>,
      afterData: updated as unknown as Record<string, unknown>,
      details: { changedFields: Object.keys(sanitizedUpdates) },
    });

    return updated;
  }

  async updateCrowdStatus(id: string, crowdStatus: CrowdStatus, actor: AuthUser): Promise<Establishment> {
    return this.update(id, { crowdStatus }, actor);
  }

  async updateSchedule(id: string, weeklySchedule: WeeklyScheduleItem[], actor: AuthUser): Promise<Establishment> {
    return this.update(id, { weeklySchedule }, actor);
  }

  async updatePromotion(id: string, currentPromotion: Promotion, actor: AuthUser): Promise<Establishment> {
    return this.update(id, { currentPromotion }, actor);
  }

  async blockEstablishment(id: string, actor: AuthUser, reason?: string): Promise<Establishment> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }

    const before = await this.repository.findById(id);
    if (!before) throw new Error('ESTABLISHMENT_NOT_FOUND');

    const updated = await this.repository.update(id, { publicationStatus: 'suspended' });
    if (!updated) throw new Error('ESTABLISHMENT_BLOCK_FAILED');

    await authService.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'block_establishment',
      entityType: 'establishment',
      entityId: id,
      beforeData: before as unknown as Record<string, unknown>,
      afterData: updated as unknown as Record<string, unknown>,
      details: { reason: reason || 'Bloqueio administrativo por admin' },
    });

    return updated;
  }

  async unblockEstablishment(id: string, actor: AuthUser): Promise<Establishment> {
    if (actor.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_REQUIRED');
    }

    const before = await this.repository.findById(id);
    if (!before) throw new Error('ESTABLISHMENT_NOT_FOUND');

    const updated = await this.repository.update(id, { publicationStatus: 'published' });
    if (!updated) throw new Error('ESTABLISHMENT_UNBLOCK_FAILED');

    await authService.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'unblock_establishment',
      entityType: 'establishment',
      entityId: id,
      beforeData: before as unknown as Record<string, unknown>,
      afterData: updated as unknown as Record<string, unknown>,
      details: { action: 'Reativação de publicação por admin' },
    });

    return updated;
  }
}

export const establishmentService = new EstablishmentService();
