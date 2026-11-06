export function getSupabaseAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export async function supabaseAdminRequest(path: string, init: RequestInit = {}) {
  const config = getSupabaseAdminConfig();
  if (!config) throw new Error('SUPABASE_NOT_CONFIGURED');

  const headers = new Headers(init.headers);
  headers.set('apikey', config.key);
  if (config.key.startsWith('sb_secret_')) {
    // Supabase's newer secret API keys are sent as apikey, not as JWT Bearer tokens.
    headers.delete('Authorization');
  } else {
    // Legacy service_role keys are JWTs and must be sent as the Bearer token.
    headers.set('Authorization', `Bearer ${config.key}`);
  }
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!response.ok) {
    const authMode = config.key.startsWith('sb_secret_')
      ? 'secret-api-key'
      : config.key.startsWith('eyJ')
        ? 'legacy-jwt'
        : 'unknown-key-format';
    console.error('supabase-admin-request', { status: response.status, authMode });
  }
  return response;
}

export async function supabaseAdminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await supabaseAdminRequest(path, init);
  if (!response.ok) {
    throw new Error(`SUPABASE_ADMIN_REQUEST_FAILED_${response.status}`);
  }
  return response.json() as Promise<T>;
}
