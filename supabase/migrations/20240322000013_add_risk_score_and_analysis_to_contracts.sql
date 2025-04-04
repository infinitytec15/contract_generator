-- Add risk score and analysis columns to contracts table
ALTER TABLE contracts
ADD COLUMN risk_score INTEGER,
ADD COLUMN risk_analysis JSONB;

-- Create index on risk_score for faster queries
CREATE INDEX idx_contracts_risk_score ON contracts(risk_score);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
