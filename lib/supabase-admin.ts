export function getSupabaseAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function supabaseAdminRequest(path: string, init: RequestInit = {}) {
  const config = getSupabaseAdminConfig();
  if (!config) throw new Error('SUPABASE_NOT_CONFIGURED');

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}

export async function supabaseAdminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await supabaseAdminRequest(path, init);
  if (!response.ok) {
    throw new Error(`SUPABASE_ADMIN_REQUEST_FAILED_${response.status}`);
  }
  return response.json() as Promise<T>;
}
