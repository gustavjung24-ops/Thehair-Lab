-- Migration 0002: Add admin_data_json column to salons for admin-con persistence
-- This allows storing full admin version 3 data (theme, services, gallery, etc)
-- for each salon template, enabling D1-backed persistence.

ALTER TABLE salons ADD COLUMN IF NOT EXISTS admin_data_json TEXT;
