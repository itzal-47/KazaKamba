-- Add legenda column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS legenda TEXT;

-- Add comment on the column
COMMENT ON COLUMN stories.legenda IS 'Caption/text for the story';
