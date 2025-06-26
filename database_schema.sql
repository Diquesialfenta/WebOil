-- SQL Schema for Maltero Oil Exchange Database
-- Run this in your Supabase SQL Editor

-- 1. Create profiles table to extend auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create oil_orders table for tracking exchanges
CREATE TABLE oil_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Order details
  used_oil_liters INTEGER NOT NULL DEFAULT 0,
  new_oil_liters INTEGER NOT NULL DEFAULT 0,
  exchange_rate INTEGER NOT NULL DEFAULT 10, -- 10:1 ratio

  -- Pickup details
  pickup_address TEXT NOT NULL,
  pickup_date DATE,
  pickup_time TEXT,
  notes TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create loyalty_rewards table for tracking milestones
CREATE TABLE loyalty_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Reward details
  total_liters_delivered INTEGER NOT NULL DEFAULT 0,
  milestone_reached INTEGER NOT NULL DEFAULT 0, -- 1000, 2000, etc.
  reward_description TEXT,
  reward_claimed BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Oil orders policies
CREATE POLICY "Users can view own orders"
  ON oil_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON oil_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON oil_orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own orders (optional)
CREATE POLICY "Users can delete own orders"
  ON oil_orders FOR DELETE
  USING (auth.uid() = user_id);

-- Loyalty rewards policies
CREATE POLICY "Users can view own rewards"
  ON loyalty_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Create functions for automatic calculations

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_oil_orders
  BEFORE UPDATE ON oil_orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 7. Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
  u.id as user_id,
  u.email,
  p.name,
  COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.used_oil_liters ELSE 0 END), 0) as total_used_oil_delivered,
  COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.new_oil_liters ELSE 0 END), 0) as total_new_oil_received,
  COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
  MAX(CASE WHEN o.status = 'completed' THEN o.completed_at END) as last_delivery_date
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN oil_orders o ON u.id = o.user_id
GROUP BY u.id, u.email, p.name;

-- Grant permissions for the view
GRANT SELECT ON user_stats TO authenticated;

-- 8. Sample data (optional - for testing)
-- INSERT INTO oil_orders (user_id, used_oil_liters, new_oil_liters, pickup_address, status, notes)
-- VALUES (auth.uid(), 50, 5, 'Test Address 123', 'completed', 'Sample completed order');
