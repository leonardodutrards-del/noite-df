-- Migração 004: snapshot operacional do painel do parceiro.
ALTER TABLE establishments
  ADD COLUMN IF NOT EXISTS vibe text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS music text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audience text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS maps_query text,
  ADD COLUMN IF NOT EXISTS owner_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crowd_status text NOT NULL DEFAULT 'a confirmar'
    CHECK (crowd_status IN ('tranquilo','movimentado','lotado','a confirmar')),
  ADD COLUMN IF NOT EXISTS weekly_schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_promotion jsonb,
  ADD COLUMN IF NOT EXISTS public_ratings jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS public_rating_summary jsonb;
