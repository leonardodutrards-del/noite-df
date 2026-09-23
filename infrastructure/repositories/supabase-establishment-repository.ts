import type { EstablishmentRepository } from '@/modules/establishments/repository';
import type { Establishment } from '@/modules/establishments/types';

type SupabaseRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  region: string;
  address: string;
  instagram: string | null;
  whatsapp: string | null;
  price_range: string | null;
  vibe: string[] | null;
  music: string[] | null;
  audience: string[] | null;
  maps_query: string | null;
  owner_managed: boolean | null;
  crowd_status: string | null;
  weekly_schedule: unknown[] | null;
  current_promotion: Record<string, unknown> | null;
  public_ratings: unknown[] | null;
  public_rating_summary: Record<string, unknown> | null;
  publication_status: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

interface SupabaseConfig {
  url: string;
  key: string;
}

function config(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const cfg = config();
  if (!cfg) throw new Error('Supabase not configured');

  const paramStr = params.map((_, i) => `$${i + 1}`).join(',');
  const body = {
    query: sql,
    params: params.length > 0 ? params : undefined,
  };

  const response = await fetch(`${cfg.url}/rest/v1/rpc/custom_query`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.status}`);
  }

  return response.json();
}

async function fetchFromTable(
  table: string,
  filters?: Record<string, unknown>
): Promise<unknown[]> {
  const cfg = config();
  if (!cfg) throw new Error('Supabase not configured');

  let url = `${cfg.url}/rest/v1/${table}`;
  if (filters) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${table}: ${response.status}`);
  }

  return response.json();
}

async function insertRow(table: string, row: Record<string, unknown>): Promise<unknown> {
  const cfg = config();
  if (!cfg) throw new Error('Supabase not configured');

  const response = await fetch(`${cfg.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to insert into ${table}: ${response.status}`);
  }

  return response.json();
}

async function updateRow(
  table: string,
  filters: Record<string, unknown>,
  updates: Record<string, unknown>
): Promise<unknown> {
  const cfg = config();
  if (!cfg) throw new Error('Supabase not configured');

  let url = `${cfg.url}/rest/v1/${table}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    params.append(key, `eq.${value}`);
  }
  url += `?${params.toString()}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(updates),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${table}: ${response.status}`);
  }

  return response.json();
}

function rowToEstablishment(row: SupabaseRow): Establishment {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    type: row.type as Establishment['type'],
    description: row.description || '',
    address: row.address,
    vibe: row.vibe ?? [],
    music: row.music ?? [],
    audience: row.audience ?? [],
    price: (row.price_range || '$$') as Establishment['price'],
    instagram: row.instagram || undefined,
    whatsapp: row.whatsapp || undefined,
    mapsQuery: row.maps_query || `${row.name} ${row.region} DF`,
    verified: Boolean(row.verified_at),
    ownerManaged: row.owner_managed ?? false,
    crowdStatus: (row.crowd_status || 'a confirmar') as Establishment['crowdStatus'],
    currentPromotion: (row.current_promotion || undefined) as Establishment['currentPromotion'],
    weeklySchedule: (row.weekly_schedule ?? []) as Establishment['weeklySchedule'],
    lastUpdated: new Date(row.updated_at).toISOString().split('T')[0],
    publicationStatus: row.publication_status as Establishment['publicationStatus'],
    publicRatings: (row.public_ratings ?? []) as Establishment['publicRatings'],
    publicRatingSummary: (row.public_rating_summary || {
      sourceCount: 0,
      calculatedAt: new Date().toISOString(),
    }) as Establishment['publicRatingSummary'],
  };
}

function establishmentPatchToRow(establishment: Partial<Establishment>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (establishment.name !== undefined) row.name = establishment.name;
  if (establishment.type !== undefined) row.type = establishment.type;
  if (establishment.description !== undefined) row.description = establishment.description;
  if (establishment.region !== undefined) row.region = establishment.region;
  if (establishment.address !== undefined) row.address = establishment.address;
  if (establishment.instagram !== undefined) row.instagram = establishment.instagram;
  if (establishment.whatsapp !== undefined) row.whatsapp = establishment.whatsapp;
  if (establishment.price !== undefined) row.price_range = establishment.price;
  if (establishment.vibe !== undefined) row.vibe = establishment.vibe;
  if (establishment.music !== undefined) row.music = establishment.music;
  if (establishment.audience !== undefined) row.audience = establishment.audience;
  if (establishment.mapsQuery !== undefined) row.maps_query = establishment.mapsQuery;
  if (establishment.ownerManaged !== undefined) row.owner_managed = establishment.ownerManaged;
  if (establishment.crowdStatus !== undefined) row.crowd_status = establishment.crowdStatus;
  if (establishment.weeklySchedule !== undefined) row.weekly_schedule = establishment.weeklySchedule;
  if (establishment.currentPromotion !== undefined) row.current_promotion = establishment.currentPromotion;
  if (establishment.publicRatings !== undefined) row.public_ratings = establishment.publicRatings;
  if (establishment.publicRatingSummary !== undefined) {
    row.public_rating_summary = establishment.publicRatingSummary;
  }
  if (establishment.publicationStatus !== undefined) {
    row.publication_status = establishment.publicationStatus;
  }
  return row;
}

function establishmentToInsertRow(establishment: Establishment): Record<string, unknown> {
  return {
    id: establishment.id,
    slug: establishment.id,
    ...establishmentPatchToRow(establishment),
  };
}

export class SupabaseEstablishmentRepository implements EstablishmentRepository {
  async listAll(): Promise<Establishment[]> {
    try {
      const rows = (await fetchFromTable('establishments')) as unknown[];
      return rows.map((row) => rowToEstablishment(row as SupabaseRow));
    } catch (error) {
      console.error('Error listing establishments:', error);
      return [];
    }
  }

  async listPublished(): Promise<Establishment[]> {
    try {
      const rows = (await fetchFromTable('establishments', {
        publication_status: 'eq.published',
      })) as unknown[];
      return rows.map((row) => rowToEstablishment(row as SupabaseRow));
    } catch (error) {
      console.error('Error listing published establishments:', error);
      return [];
    }
  }

  async findById(id: string): Promise<Establishment | null> {
    try {
      const rows = (await fetchFromTable('establishments', { id: `eq.${id}` })) as unknown[];
      if (rows.length === 0) return null;
      return rowToEstablishment(rows[0] as SupabaseRow);
    } catch (error) {
      console.error('Error finding establishment:', error);
      return null;
    }
  }

  async update(id: string, updates: Partial<Establishment>): Promise<Establishment | null> {
    try {
      const existing = await this.findById(id);
      if (!existing) return null;

      const updateData = {
        ...establishmentPatchToRow(updates),
        updated_at: new Date().toISOString(),
      };

      const rows = (await updateRow('establishments', { id }, updateData)) as unknown[];
      if (rows.length === 0) return null;
      return rowToEstablishment(rows[0] as SupabaseRow);
    } catch (error) {
      console.error('Error updating establishment:', error);
      return null;
    }
  }

  async create(item: Establishment): Promise<Establishment> {
    try {
      const row = establishmentToInsertRow(item);
      const result = (await insertRow('establishments', {
        ...row,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as unknown;

      if (Array.isArray(result) && result.length > 0) {
        return rowToEstablishment(result[0] as SupabaseRow);
      }

      return item;
    } catch (error) {
      console.error('Error creating establishment:', error);
      return item;
    }
  }
}

export function createSupabaseEstablishmentRepository(): EstablishmentRepository {
  return new SupabaseEstablishmentRepository();
}
