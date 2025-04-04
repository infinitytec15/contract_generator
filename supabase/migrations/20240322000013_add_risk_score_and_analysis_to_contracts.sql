-- Add risk score and risk analysis to contracts table
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS risk_score INTEGER;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS risk_analysis JSONB;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
