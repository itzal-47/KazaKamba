/*
# KazaKamba Initial Schema

1. New Tables
- `categories` - Listing categories (Obras, Tech, Educação, Casas, Serviços, Trabalho)
- `listings` - Main listings/anúncios table with title, description, price, photos, contact info
- `favorites` - User favorites (stored per session/device using client_id)

2. Security
- Enable RLS on all tables
- Allow anon + authenticated CRUD (single-tenant, no auth required for MVP)
- Listings are publicly viewable, anyone can create

3. Notes
- Uses client_id (UUID stored in localStorage) for favorites tracking without auth
- Photos stored as JSON array of URLs
- Price is optional (some listings may be free/negotiable)
- Distance field is text for now (future: geolocation)
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
  price decimal(10,2),
  negotiable boolean NOT NULL DEFAULT false,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  phone text,
  whatsapp text,
  location text,
  distance text DEFAULT '2km',
  client_id uuid NOT NULL,
  views int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, client_id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Categories policies (read-only for everyone)
DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Listings policies
DROP POLICY IF EXISTS "anon_read_listings" ON listings;
CREATE POLICY "anon_read_listings" ON listings FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
CREATE POLICY "anon_insert_listings" ON listings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_listings" ON listings;
CREATE POLICY "anon_update_listings" ON listings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_listings" ON listings;
CREATE POLICY "anon_delete_listings" ON listings FOR DELETE
  TO anon, authenticated USING (true);

-- Favorites policies
DROP POLICY IF EXISTS "anon_read_favorites" ON favorites;
CREATE POLICY "anon_read_favorites" ON favorites FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Obras', 'obras', 'HardHat', 1),
  ('Tech', 'tech', 'Laptop', 2),
  ('Educação', 'educacao', 'GraduationCap', 3),
  ('Casas', 'casas', 'Home', 4),
  ('Serviços', 'servicos', 'Wrench', 5),
  ('Trabalho', 'trabalho', 'Briefcase', 6)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_favorites_client ON favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);