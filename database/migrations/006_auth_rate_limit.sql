-- Migração 006: rate limiting persistente para autenticação.
CREATE TABLE IF NOT EXISTS security_rate_limits (
  key_hash text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION security_check_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  started_at timestamptz;
BEGIN
  SELECT attempts, window_started_at
    INTO current_attempts, started_at
  FROM security_rate_limits
  WHERE key_hash = p_key_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO security_rate_limits(key_hash, attempts, window_started_at, updated_at)
    VALUES (p_key_hash, 1, now(), now());
    RETURN true;
  END IF;

  IF started_at + make_interval(secs => p_window_seconds) <= now() THEN
    UPDATE security_rate_limits
      SET attempts = 1, window_started_at = now(), updated_at = now()
      WHERE key_hash = p_key_hash;
    RETURN true;
  END IF;

  IF current_attempts >= p_limit THEN
    RETURN false;
  END IF;

  UPDATE security_rate_limits
    SET attempts = attempts + 1, updated_at = now()
    WHERE key_hash = p_key_hash;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION security_check_rate_limit(text, integer, integer) FROM PUBLIC;
