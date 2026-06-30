/*
# Critical Schema and Security Fixes

This migration resolves critical schema mismatches and security vulnerabilities.

## 1. Schema Fixes
- Add `categoria` text column to listings (React uses `categoria`, not `category_id`)
- Add `telefone` text column to listings (React uses `telefone`, not `phone`)
- Make `favorites.client_id` nullable (currently NOT NULL, blocks inserts with usuario_id)

## 2. Security Fixes - RLS Policies
- Drop insecure permissive policies on listings
- Create owner-scoped policies for listings (SELECT public, INSERT/UPDATE/DELETE owner-only)
- Drop insecure permissive policies on favorites
- Create owner-scoped policies for favorites

## 3. Performance Fix
- Create atomic `increment_listing_views` function to replace race-condition-prone read-modify-write

## 4. Data Cleanup
- Drop unused `renamed_photos` flag column from listings
- Sync `views` column with `visualizacoes` for backwards compatibility

## Important Notes
1. Listings SELECT remains public (anyone can browse) but modification requires ownership
2. Favorites are completely private - users only see their own favorites
3. `categoria` column allows React code to work without changes
4. The atomic view increment prevents lost updates under concurrent access
*/

-- ============================================================================
-- SECTION 1: Add Missing Columns
-- ============================================================================

-- Add categoria text column (React uses this instead of category_id FK)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS categoria text;

-- Add telefone column (React uses this instead of phone)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS telefone text;

-- Sync telefone with existing phone data
UPDATE listings SET telefone = phone WHERE telefone IS NULL AND phone IS NOT NULL;

-- Sync categoria with category_id by looking up category names
UPDATE listings l SET categoria = c.name 
FROM categories c 
WHERE l.categoria IS NULL AND l.category_id = c.id;

-- ============================================================================
-- SECTION 2: Fix Favorites Table - Make client_id Nullable
-- ============================================================================

-- Make client_id nullable so inserts with usuario_id work
ALTER TABLE favorites ALTER COLUMN client_id DROP NOT NULL;

-- ============================================================================
-- SECTION 3: Fix Listings RLS Policies
-- ============================================================================

-- Drop old insecure policies from migration 001
DROP POLICY IF EXISTS "anon_select_listings" ON listings;
DROP POLICY IF EXISTS "anon_insert_listings" ON listings;
DROP POLICY IF EXISTS "anon_update_listings" ON listings;
DROP POLICY IF EXISTS "anon_delete_listings" ON listings;

-- Listings are publicly viewable (marketplace needs browsing)
CREATE POLICY "listings_select_public" ON listings FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Only authenticated users can create listings (owner-scoped)
CREATE POLICY "listings_insert_owner" ON listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- Only owners can update their listings
CREATE POLICY "listings_update_owner" ON listings FOR UPDATE
  TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Only owners can delete their listings
CREATE POLICY "listings_delete_owner" ON listings FOR DELETE
  TO authenticated USING (auth.uid() = usuario_id);

-- ============================================================================
-- SECTION 4: Fix Favorites RLS Policies
-- ============================================================================

-- Drop any existing policies
DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;

-- Users can only see their own favorites
CREATE POLICY "favorites_select_owner" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = usuario_id);

-- Users can only add their own favorites
CREATE POLICY "favorites_insert_owner" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- Users can only delete their own favorites
CREATE POLICY "favorites_delete_owner" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = usuario_id);

-- ============================================================================
-- SECTION 5: Atomic View Counter Function
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_listing_views(listing_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET visualizacoes = COALESCE(visualizacoes, 0) + 1,
      views = COALESCE(views, 0) + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 6: Cleanup - Remove Flag Column
-- ============================================================================

-- Remove the flag column used during migration 002 rename
ALTER TABLE listings DROP COLUMN IF EXISTS renamed_photos;

-- ============================================================================
-- SECTION 7: Index for Performance
-- ============================================================================

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_listings_usuario_id ON listings(usuario_id);
CREATE INDEX IF NOT EXISTS idx_listings_categoria ON listings(categoria);
CREATE INDEX IF NOT EXISTS idx_listings_provincia ON listings(provincia);
CREATE INDEX IF NOT EXISTS idx_favorites_usuario_id ON favorites(usuario_id);