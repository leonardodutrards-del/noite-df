import { getSupabaseAdminConfig, supabaseAdminJson } from '@/lib/supabase-admin';

type AdminUsersResponse = {
  users?: Array<{ id: string; email?: string | null; created_at?: string | null }>;
};

type ProfileRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  role: string;
  created_at: string;
};

export type AccountIntegrity = {
  generatedAt: string;
  authUsers: number;
  profiles: number;
  linkedProfiles: number;
  authWithoutProfile: number;
  profilesWithoutAuth: number;
  duplicateEmailGroups: number;
  healthy: boolean;
};

export async function getAccountIntegrity(): Promise<AccountIntegrity> {
  const config = getSupabaseAdminConfig();
  if (!config) throw new Error('SUPABASE_NOT_CONFIGURED');

  const [authResponse, profiles] = await Promise.all([
    fetch(`${config.url}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: 'no-store',
    }),
    supabaseAdminJson<ProfileRow[]>(
      'profiles?select=id,auth_user_id,email,role,created_at&order=created_at.desc'
    ),
  ]);

  if (!authResponse.ok) {
    throw new Error(`SUPABASE_AUTH_ADMIN_FAILED_${authResponse.status}`);
  }

  const authPayload = (await authResponse.json()) as AdminUsersResponse;
  const authUsers = authPayload.users ?? [];
  const authIds = new Set(authUsers.map((user) => user.id));
  const linkedAuthIds = new Set(
    profiles
      .map((profile) => profile.auth_user_id)
      .filter((value): value is string => Boolean(value))
  );

  const emailCounts = new Map<string, number>();
  for (const profile of profiles) {
    const email = profile.email.trim().toLowerCase();
    emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1);
  }

  const authWithoutProfile = authUsers.filter((user) => !linkedAuthIds.has(user.id)).length;
  const profilesWithoutAuth = profiles.filter(
    (profile) => profile.auth_user_id && !authIds.has(profile.auth_user_id)
  ).length;
  const duplicateEmailGroups = Array.from(emailCounts.values()).filter((count) => count > 1).length;
  const linkedProfiles = profiles.filter((profile) => Boolean(profile.auth_user_id)).length;

  return {
    generatedAt: new Date().toISOString(),
    authUsers: authUsers.length,
    profiles: profiles.length,
    linkedProfiles,
    authWithoutProfile,
    profilesWithoutAuth,
    duplicateEmailGroups,
    healthy: authWithoutProfile === 0 && profilesWithoutAuth === 0 && duplicateEmailGroups === 0,
  };
}
