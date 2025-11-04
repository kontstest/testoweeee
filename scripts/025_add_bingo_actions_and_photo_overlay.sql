-- Adding actions array to bingo_cards and creating photo_overlays table
ALTER TABLE public.bingo_cards ADD COLUMN IF NOT EXISTS actions jsonb DEFAULT '[]'::jsonb;

-- Create photo_overlays table for storing photo overlay templates
CREATE TABLE IF NOT EXISTS public.photo_overlays (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  template_type text NOT NULL, -- 'simple', 'elegant', 'festive'
  overlay_svg text NOT NULL, -- SVG template with placeholders
  text_positions jsonb, -- Array of text positions {x, y, fontSize, defaultText}
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_overlays ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active overlays for their event"
  ON public.photo_overlays FOR SELECT
  USING (true);

CREATE POLICY "Clients can insert overlays for their events"
  ON public.photo_overlays FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photo_overlays.event_id
      AND events.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update their event overlays"
  ON public.photo_overlays FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photo_overlays.event_id
      AND events.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can delete their event overlays"
  ON public.photo_overlays FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = photo_overlays.event_id
      AND events.client_id = auth.uid()
    )
  );
