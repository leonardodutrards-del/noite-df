-- Migração 001: Autenticação, Papéis admin / partner, Último Acesso, Auditoria e Reembolsos

-- 1. Atualizar ou estender o tipo de papel de usuário (user_role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('visitor', 'partner', 'operator', 'admin', 'partner', 'admin');
  ELSE
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Atualizar a tabela de perfis (profiles)
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
  ALTER COLUMN role TYPE TEXT;

-- 3. Atualizar a tabela de auditoria (audit_log)
ALTER TABLE IF EXISTS audit_log
  ADD COLUMN IF NOT EXISTS actor_email TEXT,
  ADD COLUMN IF NOT EXISTS actor_role TEXT,
  ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 4. Atualizar a tabela de faturamento/assinaturas (subscription_accounts) para suporte a reembolso
ALTER TABLE IF EXISTS subscription_accounts
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- 5. Atualizar políticas de Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles:
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para establishments:
DROP POLICY IF EXISTS "public_read_published_establishments" ON establishments;
CREATE POLICY "public_read_published_establishments" ON establishments
  FOR SELECT USING (publication_status = 'published');

-- Nota: Operações autenticadas de parceiros e admin são mediadas pelo servidor com validação de autorização.
