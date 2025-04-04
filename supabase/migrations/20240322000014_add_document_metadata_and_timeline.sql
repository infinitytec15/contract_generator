-- Add document metadata fields to vault_documents table
ALTER TABLE vault_documents
ADD COLUMN IF NOT EXISTS document_type VARCHAR,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS folder_path VARCHAR,
ADD COLUMN IF NOT EXISTS ocr_processed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS classification_processed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create document access logs table
CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL, -- 'view', 'download', 'share', etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent TEXT
);

-- Enable row-level security on document_access_logs
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for document_access_logs
DROP POLICY IF EXISTS "Users can view their own document access logs" ON document_access_logs;
CREATE POLICY "Users can view their own document access logs"
ON document_access_logs
FOR SELECT
USING (user_id = auth.uid());

-- Add realtime publication for document_access_logs
ALTER PUBLICATION supabase_realtime ADD TABLE document_access_logs;
