-- 025: Add US "state" to flight_schools and "is_verified" to reviews
--
-- - flight_schools.state: optional US state name (e.g. "California"). Powers the
--   home screen "filter by US state" bar and the admin school form dropdown.
-- - reviews.is_verified: admin-controlled flag used to show a "Verified" badge
--   on reviews (credibility during early user acquisition). Defaults to false.
--
-- Both additions are idempotent (safe to re-run) following the pattern in
-- 020_ensure_flight_schools_contact_columns.sql.

-- flight_schools.state ---------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'flight_schools' AND column_name = 'state'
  ) THEN
    ALTER TABLE flight_schools ADD COLUMN state VARCHAR(100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_flight_schools_state ON flight_schools (state);

-- reviews.is_verified ----------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE reviews ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_is_verified ON reviews (is_verified);

-- NOTE: the reviews table currently has no RLS. The "Verified" control is gated
-- in the UI to admins only. If you want to ENFORCE admin-only verification on the
-- server, enable RLS on reviews and add SELECT (public) / INSERT (authenticated) /
-- UPDATE (admin) policies — doing so without a SELECT policy would break public
-- review reads, so it is intentionally left out of this migration.
