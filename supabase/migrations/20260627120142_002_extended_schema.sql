/*
# KazaKamba Extended Schema

1. New Tables
- `profiles` - User profiles with location info (provincia, municipio, bairro)
- `stories` - User stories (photos/videos that expire)
- `messages` - Chat messages between users
- `chats` - Chat conversations
- `market_comments` - Comments on mercado listings

2. Modified Tables
- `listings` - Extended with usuario_id, tipo, condicao, video_url, location fields, curtidas_count

3. Security
- Enable RLS on all new tables
- Owner-scoped policies for authenticated users
- Public read for active listings

4. Notes
- User profiles linked to auth.users via id
- Messages support listing context for product inquiries
- Stories have 24-hour expiration (handled in queries)
*/

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  telefone text,
  nome text NOT NULL,
  provincia text,
  municipio text,
  bairro text,
  foto_url text,
  verificado boolean NOT NULL DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('foto', 'video')),
  curtidas int NOT NULL DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participantes uuid[] NOT NULL,
  ultimo_message text,
  ultimo_message_em timestamptz,
  listing_id uuid,
  criado_em timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  texto text NOT NULL,
  listing_context_id uuid,
  lida boolean NOT NULL DEFAULT false,
  criado_em timestamptz DEFAULT now()
);

-- Market comments table
CREATE TABLE IF NOT EXISTS market_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  texto text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- Add new columns to listings if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'usuario_id') THEN
    ALTER TABLE listings ADD COLUMN usuario_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'tipo') THEN
    ALTER TABLE listings ADD COLUMN tipo text CHECK (tipo IN ('servico', 'casa', 'mercado')) DEFAULT 'servico';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'condicao') THEN
    ALTER TABLE listings ADD COLUMN condicao text CHECK (condicao IN ('novo', 'usado'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'video_url') THEN
    ALTER TABLE listings ADD COLUMN video_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'provincia') THEN
    ALTER TABLE listings ADD COLUMN provincia text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'municipio') THEN
    ALTER TABLE listings ADD COLUMN municipio text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'bairro') THEN
    ALTER TABLE listings ADD COLUMN bairro text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'curtidas_count') THEN
    ALTER TABLE listings ADD COLUMN curtidas_count int NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'visualizacoes') THEN
    ALTER TABLE listings ADD COLUMN visualizacoes int NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'renamed_photos') THEN
    ALTER TABLE listings RENAME COLUMN photos TO fotos_urls;
    ALTER TABLE listings ADD COLUMN renamed_photos boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'negociavel') THEN
    ALTER TABLE listings ADD COLUMN negociavel boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Stories policies
DROP POLICY IF EXISTS "stories_select" ON stories;
CREATE POLICY "stories_select" ON stories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "stories_insert" ON stories;
CREATE POLICY "stories_insert" ON stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "stories_delete" ON stories;
CREATE POLICY "stories_delete" ON stories FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Chats policies
DROP POLICY IF EXISTS "chats_select" ON chats;
CREATE POLICY "chats_select" ON chats FOR SELECT TO authenticated USING (auth.uid() = ANY(participantes));

DROP POLICY IF EXISTS "chats_insert" ON chats;
CREATE POLICY "chats_insert" ON chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = ANY(participantes));

DROP POLICY IF EXISTS "chats_update" ON chats;
CREATE POLICY "chats_update" ON chats FOR UPDATE TO authenticated USING (auth.uid() = ANY(participantes));

-- Messages policies
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Market comments policies
DROP POLICY IF EXISTS "market_comments_select" ON market_comments;
CREATE POLICY "market_comments_select" ON market_comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "market_comments_insert" ON market_comments;
CREATE POLICY "market_comments_insert" ON market_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "market_comments_delete" ON market_comments;
CREATE POLICY "market_comments_delete" ON market_comments FOR DELETE TO authenticated USING (auth.uid() = usuario_id);

-- Update favorites to use usuario_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'client_id') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'usuario_id') THEN
      ALTER TABLE favorites ADD COLUMN usuario_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_usuario ON listings(usuario_id);
CREATE INDEX IF NOT EXISTS idx_listings_tipo ON listings(tipo);
CREATE INDEX IF NOT EXISTS idx_listings_provincia ON listings(provincia);
CREATE INDEX IF NOT EXISTS idx_stories_usuario ON stories(usuario_id);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_participantes ON chats USING GIN(participantes);