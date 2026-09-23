-- ETAPA 2 Step 7: Sistema de Consentimento LGPD para Visitantes
-- Migration para adicionar armazenamento de consentimento LGPD

create table lgpd_consents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  email text not null,
  phone text,
  
  -- Canais de consentimento
  consent_email boolean not null default false,
  consent_whatsapp boolean not null default false,
  consent_promotions boolean not null default false,
  consent_tickets boolean not null default false,
  consent_courtesy boolean not null default false,
  
  -- Compliance
  consent_text text not null, -- Versão do texto de consentimento aceita
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  
  -- Auditoria
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique(user_id, accepted_at) -- Permite múltiplas versões de consentimento
);

create index idx_lgpd_consents_user_id on lgpd_consents(user_id);
create index idx_lgpd_consents_email on lgpd_consents(email);
create index idx_lgpd_consents_accepted_at on lgpd_consents(accepted_at);

-- Versão de consentimento para rastreamento de mudanças
create table consent_versions (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  consent_text text not null,
  effective_from timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Insira a primeira versão do texto de consentimento
insert into consent_versions (version, consent_text, effective_from) 
values (
  1,
  'Concordo em receber comunicações de marketing, promoções, ingressos e cortesias por email e/ou WhatsApp. Posso revogar este consentimento a qualquer momento.',
  now()
);
