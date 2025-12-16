-- Drop the existing sc_characters table if it exists
DROP TABLE IF EXISTS sc_characters CASCADE;

-- Create the sc_characters table with correct uuid type for user_id
CREATE TABLE IF NOT EXISTS sc_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pronouns TEXT,
  archetype TEXT NOT NULL,
  
  -- Abilities
  will INTEGER NOT NULL DEFAULT 3,
  health INTEGER NOT NULL DEFAULT 5,
  resources INTEGER NOT NULL DEFAULT 3,
  circles INTEGER NOT NULL DEFAULT 2,
  mindchip INTEGER NOT NULL DEFAULT 0,
  
  -- Skills (stored as JSONB for flexibility)
  skills JSONB NOT NULL DEFAULT '{}',
  
  -- Background
  beliefs TEXT,
  instincts TEXT,
  past_life TEXT,
  quirk TEXT,
  
  -- Conditions (array of active conditions)
  conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Tokens
  fate_tokens INTEGER NOT NULL DEFAULT 3,
  persona_tokens INTEGER NOT NULL DEFAULT 0,
  
  -- Derived stats
  injured BOOLEAN DEFAULT false,
  max_health INTEGER NOT NULL DEFAULT 5,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT sc_characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_sc_characters_user_id ON sc_characters(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_sc_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sc_characters_updated_at_trigger
  BEFORE UPDATE ON sc_characters
  FOR EACH ROW
  EXECUTE FUNCTION update_sc_characters_updated_at();
