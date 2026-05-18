-- Add multiple images support
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Allow contenance to be stored as text for custom values
-- We keep contenance as INTEGER for existing data compatibility,
-- but the UI will now accept any integer value instead of a preset list.
