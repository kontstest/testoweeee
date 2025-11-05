-- Add photo overlay module columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS module_photo_overlay boolean default false,
ADD COLUMN IF NOT EXISTS module_photo_overlay_visible boolean default true,
ADD COLUMN IF NOT EXISTS event_type text default 'event'; -- 'wedding' or 'event'

-- Create photo_overlays table for storing overlay templates
CREATE TABLE IF NOT EXISTS public.photo_overlays (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  description text,
  template_type text not null default 'simple', -- 'simple', 'elegant', 'festive'
  overlay_svg text,
  text_positions jsonb,
  is_active boolean default true,
  order_index integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.photo_overlays ENABLE ROW LEVEL SECURITY;

-- Create policy for photo_overlays
CREATE POLICY "Clients can view overlays of their events"
  ON public.photo_overlays
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photo_overlays.event_id
      AND events.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can manage overlays of their events"
  ON public.photo_overlays
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photo_overlays.event_id
      AND events.client_id = auth.uid()
    )
  );
