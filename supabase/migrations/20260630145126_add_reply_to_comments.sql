-- Add reply_to column to market_comments
ALTER TABLE market_comments ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES market_comments(id) ON DELETE SET NULL;

-- Add comment on the column
COMMENT ON COLUMN market_comments.reply_to IS 'Reference to parent comment for threaded replies';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_market_comments_reply_to ON market_comments(reply_to);
