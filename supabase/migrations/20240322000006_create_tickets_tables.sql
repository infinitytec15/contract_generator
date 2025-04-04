-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets
-- Allow users to view their own tickets
DROP POLICY IF EXISTS "Users can view their own tickets";
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to insert their own tickets
DROP POLICY IF EXISTS "Users can insert their own tickets";
CREATE POLICY "Users can insert their own tickets"
  ON tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own tickets
DROP POLICY IF EXISTS "Users can update their own tickets";
CREATE POLICY "Users can update their own tickets"
  ON tickets FOR UPDATE
  USING (user_id = auth.uid());

-- Allow admins to view all tickets
DROP POLICY IF EXISTS "Admins can view all tickets";
CREATE POLICY "Admins can view all tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin')
    )
  );

-- Allow admins to update all tickets
DROP POLICY IF EXISTS "Admins can update all tickets";
CREATE POLICY "Admins can update all tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin')
    )
  );

-- Enable realtime for tickets
alter publication supabase_realtime add table tickets;
