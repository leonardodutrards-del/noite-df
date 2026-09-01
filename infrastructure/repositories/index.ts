import type { EstablishmentRepository } from '@/modules/establishments/repository';
import { InMemoryEstablishmentRepository } from './in-memory-establishment-repository';
import { SupabaseEstablishmentRepository } from './supabase-establishment-repository';

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let cachedRepository: EstablishmentRepository | null = null;

export function getEstablishmentRepository(): EstablishmentRepository {
  if (cachedRepository) return cachedRepository;

  // In production with Supabase configured, use Supabase
  if (isSupabaseConfigured()) {
    cachedRepository = new SupabaseEstablishmentRepository();
  } else {
    // Fallback to in-memory for development or when Supabase is not configured
    cachedRepository = new InMemoryEstablishmentRepository();
  }

  return cachedRepository;
}

export function resetEstablishmentRepositoryCache(): void {
  cachedRepository = null;
}
