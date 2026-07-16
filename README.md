# Adicionares Global Inc. — App

## Visão Geral

Plataforma social completa construída com **React + TypeScript + Vite + Supabase**.
Inclui feed social, sistema de matches, chat em tempo real, cinema, holoteca, cockpit e perfis públicos.

---

## Stack Tecnológica

| Tecnologia | Versão | Papel |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 5.8 | Tipagem estática |
| Vite | 6 | Bundler / Dev Server |
| Supabase | 2 | Backend / Auth / DB / Storage / Realtime |
| TipTap | 3 | Editor de texto rico (feed) |
| Lucide React | latest | Ícones |
| Emoji Picker React | 4 | Seletor de emojis |

---

## Estrutura do Projeto

```
/
├── App.tsx                    # Roteamento principal + tema dark/light
├── index.tsx                  # Entry point React
├── index.css                  # CSS global + variáveis de tema
├── index.html                 # HTML base (inclui todas as fontes Google, animações globais)
├── supabaseClient.ts          # Configuração do cliente Supabase
├── vite.config.ts             # Configuração do Vite
├── tsconfig.json              # Configuração TypeScript
├── package.json               # Dependências
├── .env.example               # Template de variáveis de ambiente
│
├── context/
│   └── AdicionaresContext.tsx # Context global (autenticação, tema, estado)
│
├── components/
│   ├── Card3D.tsx             # Componente de card com efeito 3D
│   ├── Carousel.tsx           # Carousel de imagens/cards
│   ├── FeedEditor.tsx         # Editor de posts rico (TipTap)
│   ├── ParticleBackground.tsx # Fundo animado com partículas
│   ├── ProfileDetailsModal.tsx# Modal de detalhes de perfil
│   ├── transloveTypes.ts      # Tipos TypeScript compartilhados
│   └── useAppBridge.ts        # Hook de comunicação entre componentes
│
├── pages/
│   ├── WelcomeScreen.tsx      # Tela de boas-vindas / login / cadastro
│   ├── FeedScreen.tsx         # Feed social (posts, reações, comentários, animações)
│   ├── MatchesScreen.tsx      # Sistema de matches / swipe
│   ├── ChatScreen.tsx         # Chat em tempo real
│   ├── HolotecaScreen.tsx     # Holoteca (biblioteca de conteúdos)
│   ├── CinemaScreen.tsx       # Cinema (vídeos e conteúdo multimídia)
│   ├── CockpitScreen.tsx      # Cockpit (painel de controle do usuário)
│   ├── IntermissivistasScreen.tsx # Tela de Intermissivistas
│   ├── ProfileEditScreen.tsx  # Edição de perfil completo
│   └── PublicProfileScreen.tsx# Perfil público de usuários
│
├── public/
│   ├── icon-192.png           # Ícone PWA 192px
│   ├── icon-512.png           # Ícone PWA 512px
│   ├── manifest.json          # Manifesto PWA
│   ├── planet-bg.jpg          # Background da tela de boas-vindas
│   └── sw.js                  # Service Worker (PWA)
│
└── supabase/
    ├── schema.sql             # Schema do banco de dados
    └── teste.sql              # Scripts de teste / seed
```

---

## Funcionalidades Principais

- ✅ **Autenticação completa** — Login, cadastro, recuperação de senha via Supabase Auth
- ✅ **Tema Dark/Light** — Alternância completa com variáveis CSS, persistido por usuário
- ✅ **Feed Social** — Posts com editor rico, imagens, reações, comentários, compartilhamentos
- ✅ **Animações** — Partículas, cards 3D, transições suaves entre telas, efeitos de hover
- ✅ **Sistema de Matches** — Swipe, likes, matches em tempo real
- ✅ **Chat em Tempo Real** — Mensagens via Supabase Realtime
- ✅ **Perfis Públicos** — Visualização de perfis com detalhes completos
- ✅ **Edição de Perfil** — Upload de foto, bio, preferências
- ✅ **Holoteca** — Biblioteca de conteúdos categorizados
- ✅ **Cinema** — Seção de vídeos e multimídia
- ✅ **Cockpit** — Painel de controle do usuário
- ✅ **PWA** — Funciona offline, instalável no celular

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- npm

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Copiar o template de variáveis de ambiente
cp .env.example .env.local

# 3. Preencher as variáveis no .env.local com seus dados do Supabase e Gemini

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:3000`.

---

## Variáveis de Ambiente

Veja o arquivo [`.env.example`](.env.example) para a lista completa de variáveis necessárias:

| Variável | Descrição |
|---|---|
| `GEMINI_API_KEY` | Chave da API do Google Gemini |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon pública do Supabase |

---

## Banco de Dados

O schema completo do banco de dados está em [`supabase/schema.sql`](supabase/schema.sql).
Execute-o no SQL Editor do seu projeto Supabase para criar todas as tabelas necessárias.

---

## Notas Importantes

- O arquivo `.env.local` **nunca** é commitado (está no `.gitignore`) — configure-o manualmente após clonar
- O tema dark/light é controlado pelo `AdicionaresContext` e aplicado via classes CSS no `body`
- Todas as animações de partículas e efeitos 3D estão em `components/ParticleBackground.tsx` e `components/Card3D.tsx`
- O feed (`pages/FeedScreen.tsx`) é o componente mais complexo — contém todas as animações de interação social
