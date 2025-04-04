-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, permissions) 
VALUES 
  ('super_admin', '{"all": true}'::jsonb),
  ('admin', '{"manage_contracts": true, "manage_forms": true, "manage_clients": true, "view_analytics": true}'::jsonb),
  ('client', '{"manage_own_contracts": true, "manage_own_forms": true, "manage_own_clients": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Enable row level security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Roles read access" ON roles;
CREATE POLICY "Roles read access"
ON roles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Roles insert access" ON roles;
CREATE POLICY "Roles insert access"
ON roles FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
));

DROP POLICY IF EXISTS "Roles update access" ON roles;
CREATE POLICY "Roles update access"
ON roles FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
));

DROP POLICY IF EXISTS "Roles delete access" ON roles;
CREATE POLICY "Roles delete access"
ON roles FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
));

DROP POLICY IF EXISTS "User roles read access" ON user_roles;
CREATE POLICY "User roles read access"
ON user_roles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "User roles insert access" ON user_roles;
CREATE POLICY "User roles insert access"
ON user_roles FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
));

DROP POLICY IF EXISTS "User roles update access" ON user_roles;
CREATE POLICY "User roles update access"
ON user_roles FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
));

DROP POLICY IF EXISTS "User roles delete access" ON user_roles;
CREATE POLICY "User roles delete access"
ON user_roles FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
));

-- Add to realtime publication
alter publication supabase_realtime add table roles;
alter publication supabase_realtime add table user_roles;
