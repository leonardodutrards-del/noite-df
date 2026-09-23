-- Migração 003: alinhar IDs legados (UUID) aos IDs textuais do domínio.
--
-- Segurança: esta migração só deve rodar em banco de desenvolvimento vazio.
-- Se já houver perfis ou estabelecimentos, ela aborta para evitar conversão ambígua
-- entre UUIDs antigos e slugs/IDs estáveis usados pelo aplicativo.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles LIMIT 1)
     OR EXISTS (SELECT 1 FROM establishments LIMIT 1) THEN
    RAISE EXCEPTION
      'Migration 003 requires empty profiles and establishments tables. Export/reconcile data before converting IDs.';
  END IF;
END $$;

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

ALTER TABLE IF EXISTS lgpd_consents DROP CONSTRAINT IF EXISTS lgpd_consents_user_id_fkey;
ALTER TABLE IF EXISTS subscription_accounts DROP CONSTRAINT IF EXISTS subscription_accounts_establishment_id_fkey;
ALTER TABLE IF EXISTS interactions DROP CONSTRAINT IF EXISTS interactions_user_id_fkey;
ALTER TABLE IF EXISTS interactions DROP CONSTRAINT IF EXISTS interactions_establishment_id_fkey;
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_establishment_id_fkey;
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS reviews_author_id_fkey;
ALTER TABLE IF EXISTS audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE IF EXISTS moderation_reviews DROP CONSTRAINT IF EXISTS moderation_reviews_reviewed_by_fkey;
ALTER TABLE IF EXISTS data_sources DROP CONSTRAINT IF EXISTS data_sources_verified_by_fkey;
ALTER TABLE IF EXISTS partner_claims DROP CONSTRAINT IF EXISTS partner_claims_establishment_id_fkey;
ALTER TABLE IF EXISTS partner_claims DROP CONSTRAINT IF EXISTS partner_claims_requester_id_fkey;
ALTER TABLE IF EXISTS partner_claims DROP CONSTRAINT IF EXISTS partner_claims_reviewed_by_fkey;
ALTER TABLE IF EXISTS promotions DROP CONSTRAINT IF EXISTS promotions_establishment_id_fkey;
ALTER TABLE IF EXISTS promotions DROP CONSTRAINT IF EXISTS promotions_created_by_fkey;
ALTER TABLE IF EXISTS promotions DROP CONSTRAINT IF EXISTS promotions_updated_by_fkey;
ALTER TABLE IF EXISTS events DROP CONSTRAINT IF EXISTS events_establishment_id_fkey;
ALTER TABLE IF EXISTS events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE IF EXISTS events DROP CONSTRAINT IF EXISTS events_updated_by_fkey;
ALTER TABLE IF EXISTS opening_hours DROP CONSTRAINT IF EXISTS opening_hours_establishment_id_fkey;
ALTER TABLE IF EXISTS establishment_tags DROP CONSTRAINT IF EXISTS establishment_tags_establishment_id_fkey;
ALTER TABLE IF EXISTS establishments DROP CONSTRAINT IF EXISTS establishments_created_by_fkey;
ALTER TABLE IF EXISTS establishments DROP CONSTRAINT IF EXISTS establishments_updated_by_fkey;
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS fk_profiles_establishment;
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_establishment_id_fkey;

ALTER TABLE profiles
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text,
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE establishments
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN created_by TYPE text USING created_by::text,
  ALTER COLUMN updated_by TYPE text USING updated_by::text;

ALTER TABLE establishment_tags
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text;

ALTER TABLE opening_hours
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text;

ALTER TABLE events
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text,
  ALTER COLUMN created_by TYPE text USING created_by::text,
  ALTER COLUMN updated_by TYPE text USING updated_by::text;

ALTER TABLE promotions
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text,
  ALTER COLUMN created_by TYPE text USING created_by::text,
  ALTER COLUMN updated_by TYPE text USING updated_by::text;

ALTER TABLE partner_claims
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text,
  ALTER COLUMN requester_id TYPE text USING requester_id::text,
  ALTER COLUMN reviewed_by TYPE text USING reviewed_by::text;

ALTER TABLE data_sources
  ALTER COLUMN entity_id TYPE text USING entity_id::text,
  ALTER COLUMN verified_by TYPE text USING verified_by::text;

ALTER TABLE moderation_reviews
  ALTER COLUMN entity_id TYPE text USING entity_id::text,
  ALTER COLUMN reviewed_by TYPE text USING reviewed_by::text;

ALTER TABLE audit_log
  ALTER COLUMN actor_id TYPE text USING actor_id::text;

ALTER TABLE reviews
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text,
  ALTER COLUMN author_id TYPE text USING author_id::text;

ALTER TABLE interactions
  ALTER COLUMN user_id TYPE text USING user_id::text,
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text;

ALTER TABLE subscription_accounts
  ALTER COLUMN establishment_id TYPE text USING establishment_id::text;

ALTER TABLE IF EXISTS lgpd_consents
  ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_establishment
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL;

ALTER TABLE establishments
  ADD CONSTRAINT establishments_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id),
  ADD CONSTRAINT establishments_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES profiles(id);

ALTER TABLE establishment_tags
  ADD CONSTRAINT establishment_tags_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE;

ALTER TABLE opening_hours
  ADD CONSTRAINT opening_hours_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE;

ALTER TABLE events
  ADD CONSTRAINT events_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL,
  ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id),
  ADD CONSTRAINT events_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES profiles(id);

ALTER TABLE promotions
  ADD CONSTRAINT promotions_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  ADD CONSTRAINT promotions_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id),
  ADD CONSTRAINT promotions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES profiles(id);

ALTER TABLE partner_claims
  ADD CONSTRAINT partner_claims_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  ADD CONSTRAINT partner_claims_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES profiles(id),
  ADD CONSTRAINT partner_claims_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);

ALTER TABLE data_sources
  ADD CONSTRAINT data_sources_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES profiles(id);

ALTER TABLE moderation_reviews
  ADD CONSTRAINT moderation_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);

ALTER TABLE audit_log
  ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id);

ALTER TABLE reviews
  ADD CONSTRAINT reviews_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  ADD CONSTRAINT reviews_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id);

ALTER TABLE interactions
  ADD CONSTRAINT interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
  ADD CONSTRAINT interactions_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL;

ALTER TABLE subscription_accounts
  ADD CONSTRAINT subscription_accounts_establishment_id_fkey
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS lgpd_consents
  ADD CONSTRAINT lgpd_consents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
