-- ============================================================
-- Wasteland Grind — Supabase Database Schema
-- Run this in the Supabase SQL Editor after creating your project.
-- ============================================================

-- Users profile (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text,
  steam_id text UNIQUE,
  is_banned boolean DEFAULT false,
  ban_until timestamptz,
  ban_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Character slots (up to 4 per user)
CREATE TABLE public.character_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  slot_index integer NOT NULL CHECK (slot_index >= 0 AND slot_index < 4),
  name text NOT NULL,
  level integer DEFAULT 1,
  hero_count integer DEFAULT 0,
  last_played_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slot_index)
);

-- Game saves (one per character slot)
CREATE TABLE public.saves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  slot_id uuid REFERENCES public.character_slots(id) NOT NULL,
  save_data jsonb NOT NULL,
  version integer NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slot_id)
);

-- Transaction audit log (anti-cheat)
CREATE TABLE public.transaction_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  slot_id uuid REFERENCES public.character_slots(id),
  game_id text,
  action text NOT NULL,
  actor_id text NOT NULL,
  target_id text,
  quantity integer,
  metadata jsonb,
  sequence_num integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Market listings (for future server-side marketplace)
CREATE TABLE public.market_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id) NOT NULL,
  category text NOT NULL,
  item_id text NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price_per_unit integer NOT NULL,
  gear_data jsonb,
  listed_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

-- Purchase orders
CREATE TABLE public.purchase_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id uuid REFERENCES public.profiles(id) NOT NULL,
  item_id text NOT NULL,
  item_name text NOT NULL,
  category text NOT NULL,
  bid_price integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  quantity_filled integer DEFAULT 0,
  escrow_amount integer NOT NULL,
  is_bot boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own slots" ON public.character_slots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own slots" ON public.character_slots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own saves" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saves" ON public.saves FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own transactions" ON public.transaction_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.transaction_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone read active listings" ON public.market_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own listings" ON public.market_listings FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Anyone read active orders" ON public.purchase_orders FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own orders" ON public.purchase_orders FOR ALL USING (auth.uid() = buyer_id);
