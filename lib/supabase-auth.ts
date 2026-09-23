import type { AuthUser, SignUpInput, UserRole } from '@/modules/auth/types';

type AuthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  error_description?: string;
  msg?: string;
};

type ProfileRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  name: string;
  role: UserRole;
  establishment_id: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return null;
  return { url, anonKey, serviceKey };
}

export function isSupabaseAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'test' && Boolean(config());
}

async function authRequest(path: string, init: RequestInit): Promise<AuthPayload> {
  const cfg = config();
  if (!cfg) throw new Error('AUTH_NOT_CONFIGURED');
  const response = await fetch(`${cfg.url}/auth/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.anonKey,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const data = (await response.json().catch(() => ({}))) as AuthPayload;
  if (!response.ok) {
    throw new Error(data.error_description || data.msg || 'Falha na autenticação.');
  }
  return data;
}

async function profileRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const cfg = config();
  if (!cfg) throw new Error('AUTH_NOT_CONFIGURED');
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}

function profileToUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    establishmentId: profile.establishment_id ?? undefined,
    lastSignInAt: profile.last_sign_in_at ?? undefined,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

async function getProfileByAuthId(authUserId: string): Promise<ProfileRow | null> {
  const response = await profileRequest(
    `profiles?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=*`
  );
  if (!response.ok) throw new Error('Falha ao carregar perfil.');
  const rows = (await response.json()) as ProfileRow[];
  return rows[0] ?? null;
}

async function upsertProfile(args: {
  authUserId: string;
  email: string;
  name: string;
  role: UserRole;
  establishmentId?: string;
}): Promise<AuthUser> {
  const now = new Date().toISOString();
  const existing = await getProfileByAuthId(args.authUserId);
  const id = existing?.id ?? `usr_${args.authUserId}`;
  const response = await profileRequest('profiles?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      id,
      auth_user_id: args.authUserId,
      email: args.email,
      name: args.name,
      role: args.role,
      establishment_id: args.establishmentId ?? existing?.establishment_id ?? null,
      last_sign_in_at: now,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    }),
  });
  if (!response.ok) throw new Error('Falha ao persistir perfil.');
  const rows = (await response.json()) as ProfileRow[];
  return profileToUser(rows[0]);
}

export async function supabasePasswordSignUp(input: SignUpInput) {
  const role: UserRole = 'visitor';
  const payload = await authRequest('signup', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        name: input.name,
        role,
        establishment_id: null,
        establishment_name: null,
      },
    }),
  });
  if (!payload.user?.id) throw new Error('Cadastro criado, mas usuário não foi retornado.');
  const user = await upsertProfile({
    authUserId: payload.user.id,
    email: payload.user.email ?? input.email,
    name: input.name,
    role,
  });
  return {
    user,
    token: payload.access_token ?? '',
    refreshToken: payload.refresh_token ?? '',
    requiresEmailConfirmation: !payload.access_token,
  };
}

export async function supabasePasswordLogin(email: string, password: string) {
  const payload = await authRequest('token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!payload.user?.id || !payload.access_token) throw new Error('Credenciais inválidas.');
  let profile = await getProfileByAuthId(payload.user.id);
  if (!profile) {
    const metadata = payload.user.user_metadata ?? {};
    await upsertProfile({
      authUserId: payload.user.id,
      email: payload.user.email ?? email,
      name: typeof metadata.name === 'string' ? metadata.name : email.split('@')[0],
      role: 'visitor',
      establishmentId:
        typeof metadata.establishment_id === 'string' ? metadata.establishment_id : undefined,
    });
    profile = await getProfileByAuthId(payload.user.id);
  }
  if (!profile) throw new Error('Perfil de usuário não encontrado.');
  await profileRequest(`profiles?id=eq.${encodeURIComponent(profile.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      last_sign_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
  return {
    user: profileToUser({ ...profile, last_sign_in_at: new Date().toISOString() }),
    token: payload.access_token,
    refreshToken: payload.refresh_token ?? '',
  };
}

export async function supabaseValidateAccessToken(accessToken: string): Promise<AuthUser | null> {
  const cfg = config();
  if (!cfg || !accessToken) return null;
  const response = await fetch(`${cfg.url}/auth/v1/user`, {
    headers: {
      apikey: cfg.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const authUser = (await response.json()) as { id?: string };
  if (!authUser.id) return null;
  const profile = await getProfileByAuthId(authUser.id);
  return profile ? profileToUser(profile) : null;
}

export async function supabaseLogout(accessToken: string): Promise<void> {
  const cfg = config();
  if (!cfg || !accessToken) return;
  await fetch(`${cfg.url}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      apikey: cfg.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  }).catch(() => undefined);
}

export async function supabaseSendPasswordReset(email: string, redirectTo: string): Promise<void> {
  await authRequest('recover', {
    method: 'POST',
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  });
}

export async function supabaseSendMagicLink(email: string, redirectTo: string): Promise<void> {
  await authRequest('otp', {
    method: 'POST',
    body: JSON.stringify({
      email,
      create_user: false,
      options: { email_redirect_to: redirectTo },
    }),
  });
}
