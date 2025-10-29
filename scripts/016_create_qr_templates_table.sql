-- Create QR templates table for saving custom templates
CREATE TABLE IF NOT EXISTS qr_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  background_type TEXT NOT NULL DEFAULT 'color', -- 'color' or 'image'
  background_value TEXT, -- hex color or image URL
  qr_background_color TEXT,
  custom_text TEXT,
  decor_image TEXT,
  include_vendors BOOLEAN DEFAULT false,
  elements JSONB DEFAULT '[]'::jsonb, -- Array of draggable elements with positions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE qr_templates ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own templates
CREATE POLICY "Clients can view their own templates"
  ON qr_templates FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can insert their own templates"
  ON qr_templates FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update their own templates"
  ON qr_templates FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can delete their own templates"
  ON qr_templates FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE client_id = auth.uid()
    )
  );

-- Super admins can manage all templates
CREATE POLICY "Super admins can manage all templates"
  ON qr_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
