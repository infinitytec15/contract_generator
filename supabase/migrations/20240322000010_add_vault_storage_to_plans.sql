-- Add vault_storage_limit column to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS vault_storage_limit BIGINT DEFAULT 104857600; -- 100MB default

-- Add trial_days column to plans table
ALTER TABLE plans ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;

-- Update existing plans to have 7-day trial
UPDATE plans SET trial_days = 7 WHERE trial_days IS NULL OR trial_days = 0;

-- Add storage_used column to users table to track storage usage
ALTER TABLE users ADD COLUMN IF NOT EXISTS vault_storage_used BIGINT DEFAULT 0;

-- Add trial_ends_at column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Add subscription_status column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial';

-- Create vault_documents table
CREATE TABLE IF NOT EXISTS vault_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100),
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on vault_documents
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for vault_documents
DROP POLICY IF EXISTS "Users can view their own vault documents";
CREATE POLICY "Users can view their own vault documents"
ON vault_documents
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own vault documents";
CREATE POLICY "Users can insert their own vault documents"
ON vault_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vault documents";
CREATE POLICY "Users can update their own vault documents"
ON vault_documents
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vault documents";
CREATE POLICY "Users can delete their own vault documents"
ON vault_documents
FOR DELETE
USING (auth.uid() = user_id);

-- Add vault_documents to realtime publication
alter publication supabase_realtime add table vault_documents;
