import crypto from 'crypto';

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function hashKey(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function checkAuthRateLimit(args: {
  ip: string;
  email: string;
  limit?: number;
  windowSeconds?: number;
}): Promise<boolean> {
  const cfg = config();
  if (!cfg || process.env.NODE_ENV === 'test') return true;

  const keyHash = hashKey(`${args.ip.toLowerCase()}|${args.email.trim().toLowerCase()}`);
  const response = await fetch(`${cfg.url}/rest/v1/rpc/security_check_rate_limit`, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_key_hash: keyHash,
      p_limit: args.limit ?? 8,
      p_window_seconds: args.windowSeconds ?? 900,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    // Fail closed for login hardening when persistence is configured.
    return false;
  }

  return (await response.json()) === true;
}

export function requestIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headers.get('x-real-ip') || 'unknown';
}
