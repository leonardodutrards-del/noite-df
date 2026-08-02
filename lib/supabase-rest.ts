type JsonRecord = Record<string, unknown>;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

export function isPersistenceEnabled() { return Boolean(config()); }

export async function insertRow(table: string, row: JsonRecord) {
  const cfg = config();
  if (!cfg) return { persisted: false as const };
  const response = await fetch(`${cfg.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(row),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Falha ao persistir em ${table}: ${response.status}`);
  return { persisted: true as const };
}
