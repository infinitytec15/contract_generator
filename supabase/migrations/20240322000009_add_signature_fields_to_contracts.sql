-- Adicionar campos de assinatura à tabela de contratos
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS signature_status TEXT,
ADD COLUMN IF NOT EXISTS signature_provider TEXT,
ADD COLUMN IF NOT EXISTS signature_token TEXT,
ADD COLUMN IF NOT EXISTS signature_data JSONB,
ADD COLUMN IF NOT EXISTS signed_file_path TEXT,
ADD COLUMN IF NOT EXISTS signed_file_url TEXT;

-- Adicionar índice para busca rápida por token de assinatura
CREATE INDEX IF NOT EXISTS idx_contracts_signature_token ON contracts(signature_token);
