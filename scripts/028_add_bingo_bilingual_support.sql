-- Add English version fields to bingo_cards table
ALTER TABLE bingo_cards
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS items_en TEXT[];

-- Add English version fields to bingo actions if they exist
ALTER TABLE bingo_cards
ADD COLUMN IF NOT EXISTS actions_en TEXT[];
