-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  plan_id UUID,
  last_login TIMESTAMP WITH TIME ZONE,
  last_ip TEXT,
  is_blocked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_login_history table
CREATE TABLE IF NOT EXISTS client_login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_payments table
CREATE TABLE IF NOT EXISTS client_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
DROP POLICY IF EXISTS "Clients select policy" ON clients;
CREATE POLICY "Clients select policy"
ON clients FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  ) OR
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Clients insert policy" ON clients;
CREATE POLICY "Clients insert policy"
ON clients FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Clients update policy" ON clients;
CREATE POLICY "Clients update policy"
ON clients FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Clients delete policy" ON clients;
CREATE POLICY "Clients delete policy"
ON clients FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

-- Create policies for client_login_history table
DROP POLICY IF EXISTS "Client login history select policy" ON client_login_history;
CREATE POLICY "Client login history select policy"
ON client_login_history FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  ) OR
  auth.uid() IN (
    SELECT user_id FROM clients WHERE id = client_id
  )
);

DROP POLICY IF EXISTS "Client login history insert policy" ON client_login_history;
CREATE POLICY "Client login history insert policy"
ON client_login_history FOR INSERT
WITH CHECK (true);

-- Create policies for plans table
DROP POLICY IF EXISTS "Plans select policy" ON plans;
CREATE POLICY "Plans select policy"
ON plans FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Plans insert policy" ON plans;
CREATE POLICY "Plans insert policy"
ON plans FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Plans update policy" ON plans;
CREATE POLICY "Plans update policy"
ON plans FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Plans delete policy" ON plans;
CREATE POLICY "Plans delete policy"
ON plans FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

-- Create policies for client_payments table
DROP POLICY IF EXISTS "Client payments select policy" ON client_payments;
CREATE POLICY "Client payments select policy"
ON client_payments FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  ) OR
  auth.uid() IN (
    SELECT user_id FROM clients WHERE id = client_id
  )
);

DROP POLICY IF EXISTS "Client payments insert policy" ON client_payments;
CREATE POLICY "Client payments insert policy"
ON client_payments FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Client payments update policy" ON client_payments;
CREATE POLICY "Client payments update policy"
ON client_payments FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

DROP POLICY IF EXISTS "Client payments delete policy" ON client_payments;
CREATE POLICY "Client payments delete policy"
ON client_payments FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name IN ('super_admin', 'admin')
  )
);

-- Insert default plans
INSERT INTO plans (name, description, price, billing_cycle, features)
VALUES 
  ('Básico', 'Plano básico para pequenas empresas', 99.90, 'monthly', '{"contracts_per_month": 10, "templates": 5, "support": "email"}'::jsonb),
  ('Profissional', 'Plano ideal para médias empresas', 199.90, 'monthly', '{"contracts_per_month": 50, "templates": 20, "support": "email,chat"}'::jsonb),
  ('Empresarial', 'Plano completo para grandes empresas', 399.90, 'monthly', '{"contracts_per_month": 200, "templates": 50, "support": "email,chat,phone"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Add to realtime publication
alter publication supabase_realtime add table clients;
alter publication supabase_realtime add table client_login_history;
alter publication supabase_realtime add table plans;
alter publication supabase_realtime add table client_payments;
