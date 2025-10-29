-- Add content_background_color to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS content_background_color TEXT DEFAULT '#ffffff';

-- Update existing events to have default white background
UPDATE events SET content_background_color = '#ffffff' WHERE content_background_color IS NULL;
