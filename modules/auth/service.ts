import crypto from 'crypto';
import type { AuthResult, AuthUser, AuditLogEntry, LoginInput, SignUpInput, SignUpVisitorInput, VisitorLoginInput, VerificationToken, UserRole, ConsentLGPD, VerificationResult } from './types';
import { isSupabaseAuthEnabled, supabaseLogout, supabasePasswordLogin, supabasePasswordSignUp, supabaseSendMagicLink, supabaseValidateAccessToken } from '@/lib/supabase-auth';

const PASSWORD_SCHEME = 'scrypt-v1';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const digest = crypto.scryptSync(password, salt, 64).toString('hex');
  return [PASSWORD_SCHEME, salt, digest].join(':');
}

function verifyPassword(password: string, encodedHash: string): boolean {
  const [scheme, salt, digestHex] = encodedHash.split(':');
  if (scheme !== PASSWORD_SCHEME || !salt || !digestHex) return false;

  const expected = Buffer.from(digestHex, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function assertLegacyAuthAllowed(): void {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LEGACY_AUTH !== 'true') {
    throw new Error('AUTH_NOT_CONFIGURED');
  }
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In-memory persistent state for local dev, test runs, and fallback
interface StoredUser extends AuthUser {
  passwordHash: string;
}

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_init_1',
    actorId: 'usr_admin_1',
    actorEmail: 'admin@noitedf.com.br',
    actorRole: 'admin',
    action: 'system_initialized',
    entityType: 'system',
    entityId: 'noite_df_core',
    details: { note: 'Sistema de autenticação e governança iniciado.' },
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

class AuthService {
  private users: Map<string, StoredUser> = new Map();
  private usersByEmail: Map<string, StoredUser> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: number }> = new Map();
  private verificationTokens: Map<string, { email: string; type: 'login' | 'signup'; expiresAt: number; createdAt: string }> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.sessions.clear();
    this.verificationTokens.clear();
    this.auditLogs = [...DEFAULT_AUDIT_LOGS];
  }

  public seedTestUser(input: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    password: string;
    establishmentId?: string;
    establishmentName?: string;
  }): AuthUser {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('TEST_ONLY_OPERATION');
    }

    const now = new Date().toISOString();
    const storedUser: StoredUser = {
      id: input.id,
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      establishmentId: input.establishmentId,
      establishmentName: input.establishmentName,
      passwordHash: hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(storedUser.id, storedUser);
    this.usersByEmail.set(storedUser.email, storedUser);
    return this.sanitizeUser(storedUser);
  }

  private isSupabaseConfigured(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    );
  }

  private sanitizeUser(stored: StoredUser): AuthUser {
    const user = { ...stored };
    delete (user as { passwordHash?: string }).passwordHash;
    return user;
  }

  public async signUp(input: SignUpInput): Promise<AuthResult> {
    if (isSupabaseAuthEnabled()) {
      const result = await supabasePasswordSignUp(input);
      return { user: result.user, token: result.token };
    }
    assertLegacyAuthAllowed();
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const password = input.password;
    const role: UserRole = input.role ?? 'partner';

    if (!email || !email.includes('@')) {
      throw new Error('E-mail inválido.');
    }
    if (!password || password.length < 12) {
      throw new Error('A senha deve conter no mínimo 12 caracteres.');
    }
    if (!name) {
      throw new Error('Nome é obrigatório.');
    }

    if (this.usersByEmail.has(email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Determine establishment ID if provided or generated
    let establishmentId = input.establishmentId;
    const establishmentName = input.establishmentName;

    if (!establishmentId && establishmentName) {
      establishmentId = establishmentName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const storedUser: StoredUser = {
      id: userId,
      email,
      name,
      role,
      establishmentId,
      establishmentName,
      passwordHash: hashPassword(password),
      lastSignInAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // If Supabase is configured in environment, persist remotely as well
    if (this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              id: userId,
              email,
              name,
              role,
              establishment_id: establishmentId,
              last_sign_in_at: now,
              created_at: now,
              updated_at: now,
            }),
          });
        }
      } catch {
        // Fallback gracefully without breaking local flow
      }
    }

    this.users.set(userId, storedUser);
    this.usersByEmail.set(email, storedUser);

    const token = generateSecureToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.sessions.set(token, { userId, expiresAt });

    const user = this.sanitizeUser(storedUser);

    await this.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'create_account',
      entityType: 'profile',
      entityId: user.id,
      details: {
        role: user.role,
        establishmentId: user.establishmentId,
        establishmentName: user.establishmentName,
      },
    });

    return { user, token };
  }

  public async login(credentials: LoginInput): Promise<AuthResult> {
    if (isSupabaseAuthEnabled()) {
      const result = await supabasePasswordLogin(
        credentials.email.trim().toLowerCase(),
        credentials.password
      );
      return { user: result.user, token: result.token };
    }
    assertLegacyAuthAllowed();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const storedUser = this.usersByEmail.get(email);
    if (!storedUser) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    if (!verifyPassword(password, storedUser.passwordHash)) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const now = new Date().toISOString();
    storedUser.lastSignInAt = now;
    storedUser.updatedAt = now;

    // Update in Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${storedUser.id}`, {
            method: 'PATCH',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ last_sign_in_at: now }),
          });
        }
      } catch {
        // Fallback gracefully
      }
    }

    const token = generateSecureToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.sessions.set(token, { userId: storedUser.id, expiresAt });

    const user = this.sanitizeUser(storedUser);

    await this.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'login',
      entityType: 'auth',
      entityId: user.id,
      details: { timestamp: now, method: 'password' },
    });

    return { user, token };
  }

  public async logout(token: string): Promise<void> {
    if (!token) return;
    if (isSupabaseAuthEnabled()) {
      await supabaseLogout(token);
      return;
    }
    const session = this.sessions.get(token);
    if (session) {
      const user = this.users.get(session.userId);
      if (user) {
        await this.logAudit({
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: 'logout',
          entityType: 'auth',
          entityId: user.id,
        });
      }
      this.sessions.delete(token);
    }
  }

  public async validateSession(token: string): Promise<AuthUser | null> {
    if (!token) return null;
    if (isSupabaseAuthEnabled()) {
      return supabaseValidateAccessToken(token);
    }
    const session = this.sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    const storedUser = this.users.get(session.userId);
    if (!storedUser) return null;

    return this.sanitizeUser(storedUser);
  }

  public async getUserById(userId: string): Promise<AuthUser | null> {
    const stored = this.users.get(userId);
    return stored ? this.sanitizeUser(stored) : null;
  }

  public async listUsers(): Promise<AuthUser[]> {
    return Array.from(this.users.values()).map((u) => this.sanitizeUser(u));
  }

  public async logAudit(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry> {
    const id = `aud_${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();
    const logEntry: AuditLogEntry = {
      ...entry,
      id,
      createdAt,
    };

    this.auditLogs.unshift(logEntry);

    // Persist to Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
            method: 'POST',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              actor_id: entry.actorId,
              actor_email: entry.actorEmail,
              actor_role: entry.actorRole,
              action: entry.action,
              entity_type: entry.entityType,
              entity_id: entry.entityId,
              details: entry.details ?? {},
              before_data: entry.beforeData ?? null,
              after_data: entry.afterData ?? null,
              created_at: createdAt,
            }),
          });
        }
      } catch {
        // Fallback gracefully
      }
    }

    return logEntry;
  }

  public async getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
    if (process.env.NODE_ENV !== 'test' && this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceKey) {
          const response = await fetch(
            `${supabaseUrl}/rest/v1/audit_log?select=*&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 500)}`,
            {
              headers: {
                apikey: serviceKey,
                Authorization: `Bearer ${serviceKey}`,
              },
              cache: 'no-store',
            }
          );
          if (response.ok) {
            const rows = (await response.json()) as Array<Record<string, unknown>>;
            return rows.map((row) => ({
              id: String(row.id),
              actorId: row.actor_id ? String(row.actor_id) : undefined,
              actorEmail: row.actor_email ? String(row.actor_email) : undefined,
              actorRole: row.actor_role as UserRole | undefined,
              action: String(row.action),
              entityType: String(row.entity_type),
              entityId: row.entity_id ? String(row.entity_id) : undefined,
              details: (row.details as Record<string, unknown>) ?? undefined,
              beforeData: (row.before_data as Record<string, unknown>) ?? undefined,
              afterData: (row.after_data as Record<string, unknown>) ?? undefined,
              createdAt: String(row.created_at),
            }));
          }
        }
      } catch (error) {
        console.error('audit-log-read', error);
      }
    }

    return this.auditLogs.slice(0, limit);
  }

  public async signUpVisitor(input: SignUpVisitorInput): Promise<AuthResult> {
    assertLegacyAuthAllowed();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const name = input.name?.trim() || email.split('@')[0]; // Use email prefix as default name

    if (!email || !email.includes('@')) {
      throw new Error('E-mail inválido.');
    }
    if (!phone || phone.length < 10) {
      throw new Error('Telefone é obrigatório (mínimo 10 dígitos).');
    }

    if (this.usersByEmail.has(email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    // Check if at least one consent channel is selected
    const hasAnyConsent = input.consentEmail || input.consentWhatsapp;
    if (!hasAnyConsent) {
      throw new Error('Você deve aceitar pelo menos um canal de comunicação.');
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Create LGPD consent record
    const consentText = 'Concordo em receber comunicações de marketing, promoções, ingressos e cortesias por email e/ou WhatsApp. Posso revogar este consentimento a qualquer momento.';
    
    const consentLGPD: ConsentLGPD = {
      email,
      phone,
      consentEmail: input.consentEmail,
      consentWhatsapp: input.consentWhatsapp,
      consentPromotions: input.consentPromotions,
      consentTickets: input.consentTickets,
      consentCourtesy: input.consentCourtesy,
      consentText,
      acceptedAt: now,
    };

    const storedUser: StoredUser = {
      id: userId,
      email,
      name,
      phone,
      role: 'visitor',
      consentLGPD,
      passwordHash: '', // Visitantes não têm senha
      lastSignInAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Persist to Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          // Create profile
          await fetch(`${supabaseUrl}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              id: userId,
              email,
              name,
              role: 'visitor',
              last_sign_in_at: now,
              created_at: now,
              updated_at: now,
            }),
          });

          // Create LGPD consent
          await fetch(`${supabaseUrl}/rest/v1/lgpd_consents`, {
            method: 'POST',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              email,
              phone,
              consent_email: input.consentEmail,
              consent_whatsapp: input.consentWhatsapp,
              consent_promotions: input.consentPromotions,
              consent_tickets: input.consentTickets,
              consent_courtesy: input.consentCourtesy,
              consent_text: consentText,
              accepted_at: now,
            }),
          });
        }
      } catch {
        // Fallback gracefully without breaking local flow
      }
    }

    this.users.set(userId, storedUser);
    this.usersByEmail.set(email, storedUser);

    const token = generateSecureToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days for visitors
    this.sessions.set(token, { userId, expiresAt });

    const user = this.sanitizeUser(storedUser);

    await this.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'visitor_signup',
      entityType: 'profile',
      entityId: user.id,
      details: {
        role: user.role,
        consentChannels: {
          email: input.consentEmail,
          whatsapp: input.consentWhatsapp,
          promotions: input.consentPromotions,
          tickets: input.consentTickets,
          courtesy: input.consentCourtesy,
        },
      },
    });

    return { user, token };
  }

  public async revokeConsent(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (user.role !== 'visitor') {
      throw new Error('Apenas visitantes podem revogar consentimento.');
    }

    const now = new Date().toISOString();
    if (user.consentLGPD) {
      user.consentLGPD.revokedAt = now;
    }
    user.updatedAt = now;

    // Update in Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/lgpd_consents?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ revoked_at: now }),
          });
        }
      } catch {
        // Fallback gracefully
      }
    }

    await this.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'consent_revoked',
      entityType: 'lgpd_consent',
      entityId: userId,
      details: { revokedAt: now },
    });
  }

  public async requestVerificationLink(email: string, type: 'login' | 'signup' = 'login'): Promise<VerificationToken> {
    if (isSupabaseAuthEnabled()) {
      if (type !== 'login') {
        throw new Error('Use o cadastro padrão para criar uma conta.');
      }
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await supabaseSendMagicLink(
        email.trim().toLowerCase(),
        `${appUrl}/api/auth/callback`
      );
      const now = new Date().toISOString();
      return {
        token: 'managed-by-supabase',
        email: email.trim().toLowerCase(),
        expiresAt: Date.now() + 15 * 60 * 1000,
        createdAt: now,
        type,
      };
    }
    assertLegacyAuthAllowed();
    const normalizedEmail = email.trim().toLowerCase();

    if (type === 'login') {
      const user = this.usersByEmail.get(normalizedEmail);
      if (!user) {
        throw new Error('E-mail não encontrado.');
      }
      if (user.role !== 'visitor') {
        throw new Error('Este e-mail não é de um visitante. Use login padrão.');
      }
    }

    // Gerar token verificável
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos
    const now = new Date().toISOString();

    this.verificationTokens.set(token, {
      email: normalizedEmail,
      type,
      expiresAt,
      createdAt: now,
    });

    // O envio por e-mail será implementado junto da autenticação persistente.
    // Nunca registrar tokens de autenticação em logs.

    await this.logAudit({
      actorEmail: normalizedEmail,
      actorRole: type === 'login' ? 'visitor' : undefined,
      action: `verification_link_requested_${type}`,
      entityType: 'verification_token',
      entityId: token.substring(0, 8),
      details: { type, email: normalizedEmail },
    });

    return {
      token,
      email: normalizedEmail,
      expiresAt,
      createdAt: now,
      type,
    };
  }

  public async verifyToken(token: string): Promise<VerificationResult> {
    assertLegacyAuthAllowed();
    const verification = this.verificationTokens.get(token);

    if (!verification) {
      return {
        success: false,
        message: 'Link de verificação inválido ou expirado.',
      };
    }

    // Verificar expiração
    if (Date.now() > verification.expiresAt) {
      this.verificationTokens.delete(token);
      return {
        success: false,
        message: 'Link de verificação expirou. Solicite um novo.',
      };
    }

    const { email, type } = verification;
    const user = this.usersByEmail.get(email);

    // Para signup: usuário não deve existir
    if (type === 'signup' && user) {
      this.verificationTokens.delete(token);
      return {
        success: false,
        message: 'Este e-mail já está cadastrado.',
      };
    }

    // Para login: usuário deve existir
    if (type === 'login' && !user) {
      this.verificationTokens.delete(token);
      return {
        success: false,
        message: 'E-mail não encontrado.',
      };
    }

    // Se é login, gerar sessão
    if (type === 'login' && user) {
      const now = new Date().toISOString();
      user.lastSignInAt = now;
      user.updatedAt = now;

      const sessionToken = generateSecureToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias
      this.sessions.set(sessionToken, { userId: user.id, expiresAt });

      // Limpar token de verificação
      this.verificationTokens.delete(token);

      const sanitized = this.sanitizeUser(user);

      await this.logAudit({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'visitor_login_verified',
        entityType: 'session',
        entityId: sessionToken.substring(0, 8),
        details: { email, type },
      });

      return {
        success: true,
        message: 'Login realizado com sucesso.',
        user: sanitized,
        token: sessionToken,
      };
    }

    // Se é signup, retornar sucesso sem criar usuário ainda
    // O usuário será criado no endpoint de signup com dados adicionais
    this.verificationTokens.delete(token);

    return {
      success: true,
      message: 'E-mail verificado. Prossiga com o cadastro completo.',
    };
  }

  public async visitorLogin(input: VisitorLoginInput): Promise<void> {
    await this.requestVerificationLink(input.email, 'login');
  }

  public async cleanExpiredTokens(): Promise<void> {
    const now = Date.now();
    const entries = Array.from(this.verificationTokens.entries());
    for (const [token, data] of entries) {
      if (now > data.expiresAt) {
        this.verificationTokens.delete(token);
      }
    }
  }

  public async convertToPartner(userId: string, establishmentId: string, establishmentName: string): Promise<AuthUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (user.role !== 'visitor') {
      throw new Error('Apenas visitantes podem se tornar parceiros.');
    }

    // Atualizar usuário
    const now = new Date().toISOString();
    user.role = 'partner';
    user.establishmentId = establishmentId;
    user.establishmentName = establishmentName;
    user.updatedAt = now;

    // Atualizar em Supabase se configurado
    if (this.isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: 'partner',
              establishment_id: establishmentId,
              updated_at: now,
            }),
          });
        }
      } catch {
        // Fallback gracefully
      }
    }

    await this.logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: 'partner',
      action: 'visitor_promoted_to_partner',
      entityType: 'profile',
      entityId: user.id,
      details: {
        establishmentId,
        establishmentName,
      },
    });

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
