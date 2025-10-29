-- Create vendors table for wedding service providers
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- photographer, videographer, dj, band, florist, catering, venue, etc.
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  price DECIMAL(10, 2),
  deposit_paid DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, paid, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON vendors(event_id);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
-- Clients can manage their own event vendors
CREATE POLICY "Clients can manage their event vendors"
  ON vendors
  FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events WHERE client_id = auth.uid()
    )
  );

-- Anyone can view vendors (for guest page)
CREATE POLICY "Anyone can view vendors"
  ON vendors
  FOR SELECT
  USING (true);

-- Super admins can manage all vendors
CREATE POLICY "Super admins can manage all vendors"
  ON vendors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
