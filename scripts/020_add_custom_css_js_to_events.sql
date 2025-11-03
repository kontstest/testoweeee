-- Add custom CSS and JS fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS custom_js TEXT;

COMMENT ON COLUMN public.events.custom_css IS 'Custom CSS code for guest page';
COMMENT ON COLUMN public.events.custom_js IS 'Custom JavaScript code for guest page';
