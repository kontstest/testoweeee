-- Add visibility flags for modules (client can hide modules even if purchased)
ALTER TABLE events ADD COLUMN IF NOT EXISTS module_photo_gallery_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS module_schedule_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS module_menu_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS module_survey_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS module_bingo_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS module_vendors_visible BOOLEAN DEFAULT TRUE;

-- Update existing events to have visibility flags match module flags
UPDATE events SET 
  module_photo_gallery_visible = module_photo_gallery,
  module_schedule_visible = module_schedule,
  module_menu_visible = module_menu,
  module_survey_visible = module_survey,
  module_bingo_visible = module_bingo,
  module_vendors_visible = CASE WHEN event_type = 'wedding' THEN TRUE ELSE FALSE END
WHERE module_photo_gallery_visible IS NULL;
