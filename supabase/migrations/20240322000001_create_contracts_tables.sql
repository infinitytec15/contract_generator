-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  branch TEXT,
  description TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  fields JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_links table
CREATE TABLE IF NOT EXISTS form_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) NOT NULL,
  url_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  client_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_link_id UUID REFERENCES form_links(id) NOT NULL,
  client_data JSONB NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) NOT NULL,
  signature_platform TEXT,
  signature_id TEXT,
  signature_hash TEXT,
  signed_document_url TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'pending',
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Contracts policies
DROP POLICY IF EXISTS "Users can view their own contracts" ON contracts;
CREATE POLICY "Users can view their own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own contracts" ON contracts;
CREATE POLICY "Users can insert their own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contracts" ON contracts;
CREATE POLICY "Users can update their own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own contracts" ON contracts;
CREATE POLICY "Users can delete their own contracts"
  ON contracts FOR DELETE
  USING (auth.uid() = user_id);

-- Forms policies
DROP POLICY IF EXISTS "Users can view forms for their contracts" ON forms;
CREATE POLICY "Users can view forms for their contracts"
  ON forms FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = forms.contract_id
    AND contracts.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert forms for their contracts" ON forms;
CREATE POLICY "Users can insert forms for their contracts"
  ON forms FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = forms.contract_id
    AND contracts.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update forms for their contracts" ON forms;
CREATE POLICY "Users can update forms for their contracts"
  ON forms FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM contracts
    WHERE contracts.id = forms.contract_id
    AND contracts.user_id = auth.uid()
  ));

-- Form links policies
DROP POLICY IF EXISTS "Users can view form links for their forms" ON form_links;
CREATE POLICY "Users can view form links for their forms"
  ON form_links FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms
    JOIN contracts ON forms.contract_id = contracts.id
    WHERE forms.id = form_links.form_id
    AND contracts.user_id = auth.uid()
  ));

-- Public access for submissions
DROP POLICY IF EXISTS "Public can insert submissions" ON submissions;
CREATE POLICY "Public can insert submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- Enable realtime
alter publication supabase_realtime add table contracts;
alter publication supabase_realtime add table forms;
alter publication supabase_realtime add table form_links;
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table signatures;
alter publication supabase_realtime add table audit_logs;