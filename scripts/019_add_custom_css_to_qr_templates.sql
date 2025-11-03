-- Add custom_css column to qr_templates table
ALTER TABLE public.qr_templates
ADD COLUMN IF NOT EXISTS custom_css TEXT;

COMMENT ON COLUMN public.qr_templates.custom_css IS 'Custom CSS styles for the template';
