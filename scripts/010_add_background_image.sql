-- Add background image and filters to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS background_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_blur INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS background_opacity INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS background_brightness INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS background_position TEXT DEFAULT 'center center';

-- Update existing events to have default values
UPDATE events
SET 
  background_blur = 40,
  background_opacity = 30,
  background_brightness = 100,
  background_position = 'center center'
WHERE background_blur IS NULL;
