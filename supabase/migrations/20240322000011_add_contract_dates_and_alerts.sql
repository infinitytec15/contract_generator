-- Add date fields for contract management
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS signature_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS effective_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS termination_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS adjustment_date TIMESTAMP WITH TIME ZONE;

-- Add alert preferences
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS alert_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_sms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_system BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS alert_days_before INTEGER DEFAULT 7;

-- Create table for contract alerts
CREATE TABLE IF NOT EXISTS contract_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'termination', 'renewal', 'adjustment'
  alert_date TIMESTAMP WITH TIME ZONE NOT NULL,
  alert_message TEXT NOT NULL,
  alert_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for contract_alerts
alter publication supabase_realtime add table contract_alerts;
