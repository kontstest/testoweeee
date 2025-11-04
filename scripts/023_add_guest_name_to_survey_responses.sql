-- Add guest_name column to survey_responses table if it doesn't exist
ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS guest_name text;

-- Add comment documenting the new column
COMMENT ON COLUMN survey_responses.guest_name IS 'Name of the guest who submitted the response (optional)';
