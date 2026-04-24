-- Hero Siege Builds Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'CREATOR', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Siege classes enum
CREATE TYPE hero_class AS ENUM (
  'Amazon', 'Demonspawn', 'Marauder', 'Necromancer', 'Nomad', 
  'Paladin', 'Pirate', 'Plague Doctor', 'Pyromancer', 'Redneck',
  'Samurai', 'Shaman', 'Viking', 'White Mage'
);

-- Builds table
CREATE TABLE IF NOT EXISTS public.builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  class hero_class NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_token TEXT,
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build tabs content (JSON storage for each tab type)
CREATE TYPE tab_type AS ENUM (
  'GEAR', 'ATTRIBUTES', 'SKILLS', 'INCARNATION', 'MERCENARY', 'FAQ', 'SHOWCASE'
);

CREATE TABLE IF NOT EXISTS public.build_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  tab_type tab_type NOT NULL,
  content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(build_id, tab_type)
);

-- Ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(build_id, user_id),
  UNIQUE(build_id, ip_address)
);

-- Guides table
CREATE TABLE IF NOT EXISTS public.guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('Beginner', 'Class Guides', 'Endgame', 'Patch Notes')),
  thumbnail_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  read_time INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tier lists table
CREATE TABLE IF NOT EXISTS public.tier_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('Overall Endgame', 'Leveling', 'Bossing', 'Speed Farming')),
  data JSONB DEFAULT '{"S":[],"A":[],"B":[],"C":[],"D":[]}',
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category)
);

-- Bosses table
CREATE TABLE IF NOT EXISTS public.bosses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  location TEXT,
  difficulty TEXT CHECK (difficulty IN ('Normal', 'Nightmare', 'Hell', 'Inferno')),
  lore TEXT,
  attack_patterns JSONB DEFAULT '[]',
  loot_table JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommended builds for bosses (junction table)
CREATE TABLE IF NOT EXISTS public.boss_recommended_builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boss_id UUID NOT NULL REFERENCES public.bosses(id) ON DELETE CASCADE,
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  UNIQUE(boss_id, build_id)
);

-- Creators/Influencers table
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  class_specialty hero_class,
  youtube_url TEXT,
  twitch_url TEXT,
  discord_url TEXT,
  twitter_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Map markers table
CREATE TABLE IF NOT EXISTS public.map_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Zones', 'Bosses', 'Events', 'Secrets')),
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  loot_info JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View tracking (for debouncing)
CREATE TABLE IF NOT EXISTS public.build_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(build_id, session_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_builds_class ON public.builds(class);
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON public.builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_is_published ON public.builds(is_published);
CREATE INDEX IF NOT EXISTS idx_builds_created_at ON public.builds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_builds_views ON public.builds(views DESC);
CREATE INDEX IF NOT EXISTS idx_build_tabs_build_id ON public.build_tabs(build_id);
CREATE INDEX IF NOT EXISTS idx_ratings_build_id ON public.ratings(build_id);
CREATE INDEX IF NOT EXISTS idx_guides_category ON public.guides(category);
CREATE INDEX IF NOT EXISTS idx_guides_is_published ON public.guides(is_published);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_recommended_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for builds
CREATE POLICY "builds_select_published" ON public.builds FOR SELECT USING (is_published = true OR user_id = auth.uid());
CREATE POLICY "builds_insert_auth" ON public.builds FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "builds_update_own" ON public.builds FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "builds_delete_own" ON public.builds FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for build_tabs
CREATE POLICY "build_tabs_select_all" ON public.build_tabs FOR SELECT USING (true);
CREATE POLICY "build_tabs_insert_build_owner" ON public.build_tabs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.builds WHERE id = build_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "build_tabs_update_build_owner" ON public.build_tabs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.builds WHERE id = build_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- RLS Policies for ratings
CREATE POLICY "ratings_select_all" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert_auth" ON public.ratings FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "ratings_update_own" ON public.ratings FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for guides (public read, admin write)
CREATE POLICY "guides_select_published" ON public.guides FOR SELECT USING (is_published = true);
CREATE POLICY "guides_insert_admin" ON public.guides FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "guides_update_admin" ON public.guides FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for tier_lists (public read, admin write)
CREATE POLICY "tier_lists_select_all" ON public.tier_lists FOR SELECT USING (true);
CREATE POLICY "tier_lists_insert_admin" ON public.tier_lists FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "tier_lists_update_admin" ON public.tier_lists FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for bosses (public read)
CREATE POLICY "bosses_select_all" ON public.bosses FOR SELECT USING (true);

-- RLS Policies for boss_recommended_builds
CREATE POLICY "boss_builds_select_all" ON public.boss_recommended_builds FOR SELECT USING (true);

-- RLS Policies for creators
CREATE POLICY "creators_select_all" ON public.creators FOR SELECT USING (true);
CREATE POLICY "creators_update_own" ON public.creators FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for map_markers
CREATE POLICY "map_markers_select_all" ON public.map_markers FOR SELECT USING (true);

-- RLS Policies for build_views (allow inserts for view tracking)
CREATE POLICY "build_views_select_all" ON public.build_views FOR SELECT USING (true);
CREATE POLICY "build_views_insert_all" ON public.build_views FOR INSERT WITH CHECK (true);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_builds_updated_at BEFORE UPDATE ON public.builds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_build_tabs_updated_at BEFORE UPDATE ON public.build_tabs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tier_lists_updated_at BEFORE UPDATE ON public.tier_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bosses_updated_at BEFORE UPDATE ON public.bosses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON public.creators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_map_markers_updated_at BEFORE UPDATE ON public.map_markers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate average rating
CREATE OR REPLACE FUNCTION public.get_build_rating(p_build_id UUID)
RETURNS TABLE(average_rating DECIMAL, vote_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(score)::DECIMAL, 0) as average_rating,
    COUNT(*) as vote_count
  FROM public.ratings
  WHERE build_id = p_build_id;
END;
$$ LANGUAGE plpgsql;
