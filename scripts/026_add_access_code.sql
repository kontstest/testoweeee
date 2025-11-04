-- Add access_code column to events table if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS access_code VARCHAR(8) UNIQUE;

-- Create function to generate unique 6-character access codes
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  new_code VARCHAR(8);
BEGIN
  LOOP
    new_code := UPPER(SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(RANDOM() * 36) + 1, 1) ||
                       SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(RANDOM() * 36) + 1, 1) ||
                       SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(RANDOM() * 36) + 1, 1) ||
                       SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(RANDOM() * 36) + 1, 1) ||
                       SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(RANDOM() * 36) + 1, 1) ||
                       SUBSTR('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', FLOOR(RANDOM() * 36) + 1, 1));
    
    EXIT WHEN NOT EXISTS(SELECT 1 FROM events WHERE access_code = new_code);
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate access codes for new events
CREATE OR REPLACE FUNCTION set_access_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NULL THEN
    NEW.access_code := generate_access_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_set_access_code ON events;
CREATE TRIGGER events_set_access_code
BEFORE INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION set_access_code();
