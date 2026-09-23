-- Migração 005: vincular a cobrança mais recente para reembolso real.
ALTER TABLE subscription_accounts
  ADD COLUMN IF NOT EXISTS provider_payment_id text;

CREATE INDEX IF NOT EXISTS subscription_accounts_provider_payment_idx
  ON subscription_accounts(provider_payment_id);
