-- Create table for contract attachments
CREATE TABLE IF NOT EXISTS contract_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for contract comments
CREATE TABLE IF NOT EXISTS contract_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for contract modification history
CREATE TABLE IF NOT EXISTS contract_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for external system integrations
CREATE TABLE IF NOT EXISTS external_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'CRM', 'ERP', 'FINANCIAL', 'HR'
  api_key TEXT,
  api_secret TEXT,
  base_url TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  status TEXT DEFAULT 'active',
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for contract-integration relationships
CREATE TABLE IF NOT EXISTS contract_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES external_integrations(id) ON DELETE CASCADE,
  external_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contract_id, integration_id)
);

-- Add realtime publication for new tables
alter publication supabase_realtime add table contract_attachments;
alter publication supabase_realtime add table contract_comments;
alter publication supabase_realtime add table contract_history;
alter publication supabase_realtime add table external_integrations;
alter publication supabase_realtime add table contract_integrations;
