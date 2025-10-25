-- Add hero_image_position field to events table
alter table public.events 
add column if not exists hero_image_position text default 'center center';

-- Update existing events to have default position
update public.events 
set hero_image_position = 'center center' 
where hero_image_position is null;
