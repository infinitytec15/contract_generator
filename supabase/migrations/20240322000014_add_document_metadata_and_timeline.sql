-- Add document metadata fields to vault_documents table
ALTER TABLE vault_documents
ADD COLUMN IF NOT EXISTS document_type VARCHAR,
ADD COLUMN IF NOT EXISTS tags JSONB,
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS folder_path VARCHAR,
ADD COLUMN IF NOT EXISTS ocr_processed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS classification_processed BOOLEAN DEFAULT FALSE;

-- Create document access logs table
CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR NOT NULL, -- 'view', 'download', etc.
  ip_address VARCHAR,
  user_agent VARCHAR,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_access_logs_document_id_fkey FOREIGN KEY (document_id) REFERENCES vault_documents(id) ON DELETE CASCADE
);

-- Create document sharing table
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES vault_documents(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id),
  shared_with UUID REFERENCES users(id),
  shared_email VARCHAR,
  access_token VARCHAR NOT NULL,
  password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT document_shares_document_id_fkey FOREIGN KEY (document_id) REFERENCES vault_documents(id) ON DELETE CASCADE
);

-- Enable realtime for new tables
alter publication supabase_realtime add table document_access_logs;
alter publication supabase_realtime add table document_shares;
