-- Add descriptions and images support to bingo items
ALTER TABLE public.bingo_cards 
ADD COLUMN IF NOT EXISTS descriptions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS descriptions_en jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Add guest name to bingo progress
ALTER TABLE public.bingo_progress
ADD COLUMN IF NOT EXISTS guest_name text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS bingo_progress_guest_id ON bingo_progress(guest_id);
CREATE INDEX IF NOT EXISTS bingo_progress_bingo_card_id ON bingo_progress(bingo_card_id);
