-- Migration 0002: no-op (admin_data_json is now part of schema.sql base init)
-- Reason:
-- 1) SQLite on D1 does not support "ADD COLUMN IF NOT EXISTS" syntax.
-- 2) Existing remote DB may already contain admin_data_json, so re-adding can fail.
-- Keep this migration as a harmless checkpoint for migration ordering.

SELECT 1;
