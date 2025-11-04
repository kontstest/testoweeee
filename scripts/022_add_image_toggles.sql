-- Add toggle fields for showing/hiding images in templates
ALTER TABLE events
ADD COLUMN show_hero_image BOOLEAN DEFAULT true,
ADD COLUMN show_background_image BOOLEAN DEFAULT true;
