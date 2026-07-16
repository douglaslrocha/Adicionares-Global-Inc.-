-- ==========================================
-- SUPABASE SCHEMA - ADICIONARES Space
-- Central Brain / Single Source of Truth (ZERO DADOS)
-- ==========================================

-- Limpar banco de dados existente para recomeçar do zero (vazio)
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS holoteca_cards CASCADE;
DROP TABLE IF EXISTS cinema_blocks CASCADE;
DROP TABLE IF EXISTS participants CASCADE;

-- 1. Tabela de Blocos do Cinema
CREATE TABLE cinema_blocks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela da Holoteca
CREATE TABLE holoteca_cards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  specialty TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  cinema_id TEXT,
  views INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  video_url TEXT,
  rich_text TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Participantes (Egrégora)
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialty TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  avatar TEXT NOT NULL,
  join_date TEXT NOT NULL,
  last_active TEXT NOT NULL,
  contribution INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Posts do Feed
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  author JSONB NOT NULL,
  content TEXT NOT NULL,
  media_type TEXT NOT NULL,
  audio_duration NUMERIC,
  stats JSONB NOT NULL DEFAULT '{"likes": 0, "views": "0", "comments": 0}'::jsonb,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_liked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS e criar Políticas de Acesso Público Total (Leitura e Escrita livre para o App)
ALTER TABLE cinema_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso público total" ON cinema_blocks;
CREATE POLICY "Acesso público total" ON cinema_blocks FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE holoteca_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso público total" ON holoteca_cards;
CREATE POLICY "Acesso público total" ON holoteca_cards FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso público total" ON participants;
CREATE POLICY "Acesso público total" ON participants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso público total" ON posts;
CREATE POLICY "Acesso público total" ON posts FOR ALL USING (true) WITH CHECK (true);
