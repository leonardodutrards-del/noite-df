/**
 * Script para migrar os 50 estabelecimentos do seed para o Supabase.
 * 
 * Uso:
 * npx tsx scripts/migrate-places-to-supabase.ts
 * 
 * Requer:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { places } from '@/data/seeds/places';

interface SupabaseConfig {
  url: string;
  key: string;
}

function config(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  
  return { url: url.replace(/\/$/, ''), key };
}

async function checkExisting(): Promise<number> {
  const cfg = config();
  const response = await fetch(`${cfg.url}/rest/v1/establishments?select=count()`, {
    method: 'GET',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check existing establishments: ${response.status}`);
  }

  const data = (await response.json()) as Array<{ count: number | null }>;
  return data[0]?.count ?? 0;
}

async function insertPlace(place: (typeof places)[0]) {
  const cfg = config();
  
  // Prepare the row for Supabase
  const row = {
    id: place.id,
    slug: place.id,
    name: place.name,
    type: place.type,
    description: place.description,
    region: place.region,
    address: place.address,
    instagram: place.instagram || null,
    whatsapp: place.whatsapp || null,
    phone: null,
    website: null,
    price_range: place.price,
    publication_status: place.publicationStatus || 'published',
    verified_at: null,
    accessibility: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const response = await fetch(`${cfg.url}/rest/v1/establishments`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to insert ${place.name}: ${response.status} - ${error}`);
  }

  console.log(`✓ Inserted: ${place.name}`);
}

async function insertTags(place: (typeof places)[0]) {
  const cfg = config();
  
  const tags: Array<{ establishment_id: string; kind: 'vibe' | 'music' | 'audience'; value: string }> = [];
  
  for (const vibe of place.vibe) {
    tags.push({ establishment_id: place.id, kind: 'vibe', value: vibe });
  }
  
  for (const music of place.music) {
    tags.push({ establishment_id: place.id, kind: 'music', value: music });
  }
  
  for (const audience of place.audience) {
    tags.push({ establishment_id: place.id, kind: 'audience', value: audience });
  }

  if (tags.length === 0) return;

  const response = await fetch(`${cfg.url}/rest/v1/establishment_tags`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(tags),
  });

  if (!response.ok) {
    console.warn(`Warning: Failed to insert tags for ${place.name}: ${response.status}`);
  }
}

async function insertPublicRatings(place: (typeof places)[0]) {
  const cfg = config();

  if (!place.publicRatings || place.publicRatings.length === 0) return;

  // Store publicRatings as JSON in a custom table or extend the establishments table
  // For now, we'll skip this as it requires schema extension
  // TODO: Create a public_ratings table if needed
}

async function main() {
  console.log('🚀 Starting migration to Supabase...\n');
  
  try {
    const existing = await checkExisting();
    console.log(`Current establishments in Supabase: ${existing}\n`);

    if (existing > 0) {
      console.log('⚠️  Supabase already has establishments. Clear them first if you want a fresh migration.');
      console.log('   SQL: DELETE FROM establishments WHERE true;\n');
      process.exit(0);
    }

    console.log(`Migrating ${places.length} establishments...\n`);

    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      await insertPlace(place);
      await insertTags(place);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Progress: ${i + 1}/${places.length}\n`);
      }
    }

    const finalCount = await checkExisting();
    console.log(`\n✅ Migration complete! Final count: ${finalCount} establishments`);
    console.log(`\nVerify with: SELECT COUNT(*) FROM establishments;`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
