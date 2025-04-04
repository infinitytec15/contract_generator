-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  department TEXT NOT NULL,
  priority TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  entity_id UUID,
  entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets
DROP POLICY IF EXISTS "Users can view their own tickets";
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tickets";
CREATE POLICY "Users can insert their own tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tickets";
CREATE POLICY "Users can update their own tickets"
  ON tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for ticket_messages
DROP POLICY IF EXISTS "Users can view messages for their tickets";
CREATE POLICY "Users can view messages for their tickets"
  ON ticket_messages FOR SELECT
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM tickets WHERE tickets.id = ticket_id AND tickets.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert messages for their tickets";
CREATE POLICY "Users can insert messages for their tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications";
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications";
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for these tables
alter publication supabase_realtime add table tickets;
alter publication supabase_realtime add table ticket_messages;
alter publication supabase_realtime add table notifications;