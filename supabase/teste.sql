-- ==========================================
-- SUPABASE SCHEMA + DADOS DE TESTE - ADICIONARES Space
-- Reset Completo: Cria tabelas e insere dados de teste automaticamente
-- ==========================================

-- Limpar banco de dados existente para recomeçar do zero
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

-- ==========================================
-- POPULAÇÃO DOS DADOS DE TESTE
-- ==========================================

-- Inserir Blocos do Cinema Padrão
INSERT INTO cinema_blocks (id, type, title, content, is_visible) VALUES
('b1', 'header', 'TÍTULO & ID', '{"title": "DESCONEXÃO MESOLÓGICA", "id": "VER-092", "specialty": "EVOLUCIOLOGIA", "date": "27 de Outubro, 2025"}', true),
('b2', 'definition', 'DEFINOLOGIA', '"A desconexão mesológica é o ato técnico de desidentificação consciente dos condicionamentos familiares, sociais e culturais, visando a predominância da paragenética sobre a biogenética no cotidiano do pesquisador."', true),
('b3', 'video', 'VÍDEO EXPOSIÇÃO', '{"url": "j0Xk73QySuc", "label": "DEFESA_TESE", "duration": "45min 12s"}', true),
('b4', 'reflection_axes', 'VETORES DE SÍNTESE', '[
  {"label": "HERANÇA_BIO", "detail": "Ruptura com o automatismo biológico hereditário.", "icon": "dna", "color": "text-blue-600"},
  {"label": "HOLOPENSENE_FAM", "detail": "Desidentificação com a pressão do grupo carnal.", "icon": "hub", "color": "text-orange-500"},
  {"label": "AUTONOMIA_MENTAL", "detail": "Predominância da paragenética sobre a mesologia.", "icon": "neurology", "color": "text-purple-500"},
  {"label": "TEÁTICA_ASSIST", "detail": "Aplicação prática da limpeza holopensênica.", "icon": "verified", "color": "text-green-600"}
]', true),
('b_redacao', 'text_section', 'REDAÇÃO TÉCNICA', '{
  "headline": "Redação da Autopesquisa",
  "text": "<p>A profundidade técnica da desconexão mesológica não deve ser subestimada...</p>",
  "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=90",
  "imageLabel": "Documento_01: Mapeamento Bioenergético",
  "axiom": "A liberdade evolutiva começa exatamente onde termina a submissão cega ao holopensene mesológico predominante."
}', true),
('b6', 'confrontology', 'CONFRONTOLOGIA', '{
  "orto": { 
    "title": "Orto-pensenidade", 
    "desc": "O caminho da homeostase e da lucidez assistencial.", 
    "items": ["Autonomia mentalsomática", "Discernimento cosmoético", "Interassistencialidade lúcida", "Priorização da paragenética"],
    "result": "Evolução acelerada e desassedio permanente."
  },
  "pato": { 
    "title": "Pato-pensenidade", 
    "desc": "O caminho do automatismo nosográfico e do egoísmo.", 
    "items": ["Submissão ao holopensene familiar", "Repetição de erros ancestrais", "Dependência emocional mesológica", "Egoísmo consciencial"],
    "result": "Estagnação consciencial e assédio interdimensional."
  }
}', true),
('b_detalhe', 'detalhologia', 'DETALHOLOGIA', '{
  "intro": "A tecnologia da desconexão exige o uso rigoroso do mentalsoma sobre o psicossoma.",
  "factors": [
    {"title": "Fator 01: Mentalsomática", "desc": "Uso do discernimento frio para avaliar pressões do ambiente.", "color": "blue"},
    {"title": "Fator 02: Energosomática", "desc": "Mapeamento da carga energética dos locais e pessoas.", "color": "purple"}
  ],
  "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
  "docLabel": "Doc_01: Sincronia de Campo"
}', true),
('b_fatuologia', 'fatulogia_dual', 'FATUOLOGIA & PARAFATUOLOGIA', '{
  "fatuologia": [
    {"item": "O automatismo biológico hereditário.", "desc": "Fato Patológico: Condicionamento primário.", "status": "bad"},
    {"item": "O registro diário de ocorrências.", "desc": "Fato Homeostático: Documentação que prova a evolução técnica.", "status": "good"}
  ],
  "parafatuologia": [
    {"item": "A sinalética energética de defesa.", "desc": "Para-fato Homeostático: Percepção que protege.", "status": "good"},
    {"item": "O auxílio dos amparadores.", "desc": "Para-fato Homeostático: Interassistencialidade.", "status": "good"}
  ]
}', true),
('b_argumento', 'argumentology', 'ARGUMENTOLOGIA', '{
  "text": "A mesologia familiar atua como um potente holopensene restritor, muitas vezes imperceptível no cotidiano.",
  "quote": "A desconexão mesológica é o marco inicial da maturidade evolutiva."
}', true),
('b_challenge', 'challenge', 'LABORATÓRIO', '[
  {"level": 1, "title": "Submissão Total", "desc": "Você age por pressão externa.", "action": "Identifique 1 hábito herdado.", "color": "bg-red-500"},
  {"level": 2, "title": "Conflito Interno", "desc": "A culpa mesológica te paralisa.", "action": "Escreva uma carta de Alforria.", "color": "bg-orange-500"}
]', true);

-- Inserir Registros da Holoteca Padrão
INSERT INTO holoteca_cards (id, title, subtitle, specialty, duration, level, cinema_id, views, status, thumbnail, video_url, rich_text, tags) VALUES
('f1', 'O Despertar da Sinalética', 'Mapeamento bioenergético e identificação de para-fenômenos.', 'PARAPSIQUISMO', '18 min', 'Platina', 'VER-092', 1250, 'Publicado', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', 'j0Xk73QySuc', '<h3>A Sinalética Consciencial</h3><p>A sinalética energética pessoal é o primeiro código de comunicação.</p>', ARRAY['Energia', 'Lucidez', 'Sinalética']),
('f1-2', 'Projeção de Curto Alcance', 'Técnicas para desdobramento no ambiente doméstico.', 'PARAPSIQUISMO', '15 min', 'Platina', '', 890, 'Publicado', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', 'j0Xk73QySuc', '<p>Relato técnico sobre a saída do corpo.</p>', ARRAY['Projeção', 'Sono', 'Despertar']),
('f3', 'Manobras Energéticas (TMBE)', 'Prática guiada para instalação do Estado Vibracional.', 'BIOENERGIA', '12 min', 'Prata', '', 2100, 'Publicado', 'https://images.unsplash.com/photo-1519681393784-d8e5b5a45742?w=800&q=80', 'j0Xk73QySuc', '<p>A Técnica da Mobilização Básica de Energias.</p>', ARRAY['EV', 'Energia', 'Prática']),
('f2', 'Paradireito e Cosmoética', 'As leis invisíveis que regem a evolução grupal.', 'COSMOÉTICA', '24 min', 'Aço', '', 950, 'Publicado', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80', 'j0Xk73QySuc', '<p>Um mergulho profundo nas leis que transcendem o direito humano.</p>', ARRAY['Ética', 'Holocarma', 'Evolução']);

-- Inserir Participantes Padrão
INSERT INTO participants (id, name, email, specialty, role, status, avatar, join_date, last_active, contribution) VALUES
('1', 'Douglas L. Rocha', 'douglas@adicionares.com', 'Epicon Sênior', 'Epicon', 'Ativo', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y', '12/01/2024', 'Agora', 980),
('2', 'Ana Paula Mendes', 'anapaula@estudos.org', 'Parapercepção', 'Membro', 'Ativo', 'https://i.pravatar.cc/150?img=32', '15/02/2024', 'Há 2h', 450),
('3', 'Carlos Silveira', 'carlos.ev@gmail.com', 'Projeciologia', 'Membro', 'Suspenso', 'https://i.pravatar.cc/150?img=22', '20/03/2024', 'Há 3 dias', 120),
('4', 'Jessie Caballero', 'jessie.epicon@uol.com', 'Evoluciologia', 'Epicon', 'Ativo', 'https://i.pravatar.cc/150?img=5', '01/01/2024', 'Ativo', 1240);

-- Inserir Posts Padrão
INSERT INTO posts (id, user_id, author, content, media_type, stats, comments) VALUES
('1', 'user-jesse', '{"name": "Jessé Cabeleireiro", "avatar": "https://i.pravatar.cc/150?img=12", "role": "Iniciante", "isVerified": true}', '<p>Alguém sabe onde consigo baixar o tratado de projeciologia em PDF? Estou começando os estudos hoje!</p>', 'none', '{"likes": 12, "views": "1.2k", "comments": 4}', '[]'),
('2', 'user-douglas', '{"name": "Douglas Rocha", "avatar": "https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png", "role": "Admin"}', '<p>Bem-vindos ao Adicionares Space! Lembrem-se de manter o nível do debate e focar na cosmoética.</p>', 'none', '{"likes": 45, "views": "3.5k", "comments": 12}', '[]');
