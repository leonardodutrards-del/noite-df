export type UserRole = 'visitor' | 'partner' | 'operator' | 'admin';

export interface ConsentLGPD {
  id?: string;
  userId?: string;
  email: string;
  phone?: string;
  consentEmail: boolean;
  consentWhatsapp: boolean;
  consentPromotions: boolean;
  consentTickets: boolean;
  consentCourtesy: boolean;
  consentText: string; // Versão do texto aceita
  acceptedAt: string;
  revokedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  establishmentId?: string;
  establishmentName?: string;
  consentLGPD?: ConsentLGPD;
  totpEnabled?: boolean;
  lastSignInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  establishmentId?: string;
  expiresAt: number;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  createdAt: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  establishmentId?: string;
  establishmentName?: string;
  role?: UserRole;
}

export interface SignUpVisitorInput {
  email: string;
  phone: string;
  name?: string;
  consentEmail: boolean;
  consentWhatsapp: boolean;
  consentPromotions: boolean;
  consentTickets: boolean;
  consentCourtesy: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VisitorLoginInput {
  email: string;
}

export interface VerificationToken {
  token: string;
  email: string;
  expiresAt: number;
  createdAt: string;
  type: 'login' | 'signup'; // Para diferenciar fluxos
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}
