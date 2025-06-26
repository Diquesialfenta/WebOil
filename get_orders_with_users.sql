-- SQL function to get orders with user information for admin panel
-- Run this in your Supabase SQL Editor

-- Create a function that can access auth.users data
CREATE OR REPLACE FUNCTION get_orders_with_users()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  used_oil_liters INTEGER,
  new_oil_liters INTEGER,
  exchange_rate INTEGER,
  pickup_address TEXT,
  pickup_date DATE,
  pickup_time TEXT,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  user_email TEXT,
  user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.used_oil_liters,
    o.new_oil_liters,
    o.exchange_rate,
    o.pickup_address,
    o.pickup_date,
    o.pickup_time,
    o.notes,
    o.status,
    o.created_at,
    o.updated_at,
    o.completed_at,
    COALESCE(au.email, 'Email no disponible') as user_email,
    COALESCE(
      p.name, 
      au.raw_user_meta_data->>'name',
      'Usuario'
    ) as user_name
  FROM oil_orders o
  LEFT JOIN auth.users au ON o.user_id = au.id
  LEFT JOIN profiles p ON o.user_id = p.id
  ORDER BY o.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION get_orders_with_users() TO authenticated;
