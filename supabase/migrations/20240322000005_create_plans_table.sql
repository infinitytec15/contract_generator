-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  features JSONB DEFAULT '{}'::jsonb,
  contract_uploads_limit INTEGER DEFAULT 10,
  client_limit INTEGER DEFAULT 10,
  contract_links_limit INTEGER DEFAULT 20,
  signature_limit INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for plans table
alter publication supabase_realtime add table plans;

-- Create default plans
INSERT INTO plans (name, description, price, billing_cycle, features, contract_uploads_limit, client_limit, contract_links_limit, signature_limit)
VALUES 
('Básico', 'Plano básico para pequenos escritórios', 49.90, 'monthly', '{"support":true,"analytics":false,"api_access":false}'::jsonb, 10, 10, 20, 20),
('Profissional', 'Plano ideal para escritórios de médio porte', 99.90, 'monthly', '{"support":true,"analytics":true,"api_access":false}'::jsonb, 50, 50, 100, 100),
('Empresarial', 'Plano completo para grandes escritórios', 199.90, 'monthly', '{"support":true,"analytics":true,"api_access":true}'::jsonb, 200, 200, 500, 500);
