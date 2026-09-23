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

function rowToEstablishment(row: SupabaseRow & Record<string, unknown>): Establishment {
  const mapsQuery = (row.mapsQuery as string) || `${row.name} ${row.region} DF`;
  const crowdStatus = (row.crowdStatus as string || 'a confirmar') as Establishment['crowdStatus'];
  const publicRatings = (row.publicRatings && Array.isArray(row.publicRatings) ? row.publicRatings : []) as Establishment['publicRatings'];
  const publicRatingSummary = row.publicRatingSummary || { sourceCount: 0, calculatedAt: new Date().toISOString() };
  
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    type: row.type as Establishment['type'],
    description: row.description || '',
    address: row.address,
    vibe: row.vibe && Array.isArray(row.vibe) ? row.vibe : [],
    music: row.music && Array.isArray(row.music) ? row.music : [],
    audience: row.audience && Array.isArray(row.audience) ? row.audience : [],
    price: (row.price_range || '$$') as Establishment['price'],
    instagram: row.instagram || undefined,
    whatsapp: row.whatsapp || undefined,
    mapsQuery,
    verified: !!row.verified_at,
    ownerManaged: (row.owner_managed as boolean) ?? false,
    crowdStatus,
    weeklySchedule: row.weeklySchedule && Array.isArray(row.weeklySchedule) ? row.weeklySchedule : [],
    lastUpdated: new Date(row.updated_at).toISOString().split('T')[0],
    publicationStatus: row.publication_status as Establishment['publicationStatus'],
    publicRatings,
    publicRatingSummary: publicRatingSummary as Establishment['publicRatingSummary'],
  };
}

function establishmentToRow(establishment: Establishment): Partial<SupabaseRow> {
  return {
    id: establishment.id,
    slug: establishment.id,
    name: establishment.name,
    type: establishment.type,
    description: establishment.description,
    region: establishment.region,
    address: establishment.address,
    instagram: establishment.instagram,
    whatsapp: establishment.whatsapp,
    price_range: establishment.price,
    publication_status: establishment.publicationStatus || 'published',
  };
}

export class SupabaseEstablishmentRepository implements EstablishmentRepository {
  async listAll(): Promise<Establishment[]> {
    try {
      const rows = (await fetchFromTable('establishments')) as unknown[];
      return rows.map((row) => rowToEstablishment(row as SupabaseRow & Record<string, unknown>));
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
      return rows.map((row) => rowToEstablishment(row as SupabaseRow & Record<string, unknown>));
    } catch (error) {
      console.error('Error listing published establishments:', error);
      return [];
    }
  }

  async findById(id: string): Promise<Establishment | null> {
    try {
      const rows = (await fetchFromTable('establishments', { id: `eq.${id}` })) as unknown[];
      if (rows.length === 0) return null;
      return rowToEstablishment(rows[0] as SupabaseRow & Record<string, unknown>);
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
        ...establishmentToRow(existing),
        ...establishmentToRow(updates as Establishment),
        updated_at: new Date().toISOString(),
      };

      const rows = (await updateRow('establishments', { id }, updateData)) as unknown[];
      if (rows.length === 0) return null;
      return rowToEstablishment(rows[0] as SupabaseRow & Record<string, unknown>);
    } catch (error) {
      console.error('Error updating establishment:', error);
      return null;
    }
  }

  async create(item: Establishment): Promise<Establishment> {
    try {
      const row = establishmentToRow(item);
      const result = (await insertRow('establishments', {
        ...row,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as unknown;

      if (Array.isArray(result) && result.length > 0) {
        return rowToEstablishment(result[0] as SupabaseRow & Record<string, unknown>);
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
