import type { EstablishmentRepository } from '@/modules/establishments/repository';
import { supabaseAdminRequest } from '@/lib/supabase-admin';
import type { Establishment } from '@/modules/establishments/types';

type SupabaseRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  agenda_url: string | null;
  operating_hours: Record<string, unknown> | null;
  menu: Record<string, unknown> | null;
  admission_note: string | null;
  contact_source_url: string | null;
  contact_checked_at: string | null;
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

async function fetchPublicFromTable(
  table: string,
  filters?: Record<string, unknown>
): Promise<unknown[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase public read is not configured');

  const params = new URLSearchParams();
  if (filters) {
    for (const [name, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) params.append(name, String(value));
    }
  }
  const query = params.toString();
  const response = await fetch(`${url}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: { apikey: key },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Public read from ${table} failed: ${response.status}`);
  return response.json();
}

async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const body = { query: sql, params: params.length > 0 ? params : undefined };
  const response = await supabaseAdminRequest('rpc/custom_query', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase query failed: ${response.status}`);
  return response.json() as Promise<T[]>;
}

async function fetchFromTable(
  table: string,
  filters?: Record<string, unknown>
): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters) {
    for (const [name, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) params.append(name, String(value));
    }
  }
  const query = params.toString();
  const path = `${table}${query ? `?${query}` : ''}`;
  const response = await supabaseAdminRequest(path, { method: 'GET' });

  // Public RLS allows only published establishments. If the privileged key is invalid,
  // keep public browsing alive with the publishable key, but never use this fallback
  // for listAll/admin-only records.
  const isPublicRead = filters?.publication_status === 'eq.published' || typeof filters?.id === 'string';
  if (response.status === 401 && isPublicRead) {
    console.warn('Supabase admin key rejected; retrying published establishment read with public key');
    return fetchPublicFromTable(table, filters);
  }
  if (!response.ok) throw new Error(`Failed to fetch from ${table}: ${response.status}`);
  return response.json();
}

async function insertRow(table: string, row: Record<string, unknown>): Promise<unknown> {
  const response = await supabaseAdminRequest(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(`Failed to insert into ${table}: ${response.status}`);
  return response.json();
}

async function updateRow(
  table: string,
  filters: Record<string, unknown>,
  updates: Record<string, unknown>
): Promise<unknown> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) params.append(key, `eq.${value}`);
  const query = params.toString();
  const response = await supabaseAdminRequest(`${table}?${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Failed to update ${table}: ${response.status}`);
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
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    vibe: row.vibe ?? [],
    music: row.music ?? [],
    audience: row.audience ?? [],
    price: (row.price_range || undefined) as Establishment['price'],
    instagram: row.instagram || undefined,
    whatsapp: row.whatsapp || undefined,
    businessContact:
      row.phone || row.whatsapp
        ? {
            phone: row.phone || row.whatsapp || '',
            whatsapp: row.whatsapp || undefined,
            sourceUrl: row.contact_source_url || row.website || row.instagram || '',
            checkedAt: row.contact_checked_at || new Date(row.updated_at).toISOString().split('T')[0],
          }
        : undefined,
    operatingHours: (row.operating_hours || undefined) as Establishment['operatingHours'],
    agendaUrl: row.agenda_url || undefined,
    menu: (row.menu || undefined) as Establishment['menu'],
    admissionNote: row.admission_note || undefined,
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
  if (establishment.latitude !== undefined) row.latitude = establishment.latitude;
  if (establishment.longitude !== undefined) row.longitude = establishment.longitude;
  if (establishment.instagram !== undefined) row.instagram = establishment.instagram;
  if (establishment.whatsapp !== undefined) row.whatsapp = establishment.whatsapp;
  if (establishment.businessContact !== undefined) {
    row.phone = establishment.businessContact.phone;
    row.whatsapp = establishment.businessContact.whatsapp ?? row.whatsapp;
    row.contact_source_url = establishment.businessContact.sourceUrl;
    row.contact_checked_at = establishment.businessContact.checkedAt;
  }
  if (establishment.operatingHours !== undefined) row.operating_hours = establishment.operatingHours;
  if (establishment.agendaUrl !== undefined) row.agenda_url = establishment.agendaUrl;
  if (establishment.menu !== undefined) row.menu = establishment.menu;
  if (establishment.admissionNote !== undefined) row.admission_note = establishment.admissionNote;
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
