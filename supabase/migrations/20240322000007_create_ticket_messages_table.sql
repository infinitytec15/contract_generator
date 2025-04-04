-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_messages
-- Allow users to select their own messages or messages for tickets they own
DROP POLICY IF EXISTS "Users can view their own ticket messages";
CREATE POLICY "Users can view their own ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    user_id = auth.uid() OR 
    ticket_id IN (SELECT id FROM tickets WHERE user_id = auth.uid())
  );

-- Allow users to insert their own messages
DROP POLICY IF EXISTS "Users can insert their own ticket messages";
CREATE POLICY "Users can insert their own ticket messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow admins to view all ticket messages
DROP POLICY IF EXISTS "Admins can view all ticket messages";
CREATE POLICY "Admins can view all ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin')
    )
  );

-- Allow admins to insert ticket messages
DROP POLICY IF EXISTS "Admins can insert ticket messages";
CREATE POLICY "Admins can insert ticket messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'super_admin')
    )
  );

-- Enable realtime for ticket_messages
alter publication supabase_realtime add table ticket_messages;
