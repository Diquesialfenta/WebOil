-- SCRIPT PARA CORREGIR ERROR DE RLS EN oil_orders
-- Ejecuta este script en tu Supabase SQL Editor

-- 1. Primero, eliminar todas las políticas existentes en oil_orders
DROP POLICY IF EXISTS "Users can view own orders" ON oil_orders;
DROP POLICY IF EXISTS "Users can create own orders" ON oil_orders;
DROP POLICY IF EXISTS "Users can update own orders" ON oil_orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON oil_orders;

-- 2. Verificar que RLS esté habilitado
ALTER TABLE oil_orders ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas más permisivas para debugging
CREATE POLICY "Enable read access for authenticated users" 
  ON oil_orders FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
  ON oil_orders FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" 
  ON oil_orders FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 4. Verificar que la función auth.uid() funcione
CREATE OR REPLACE FUNCTION check_auth()
RETURNS TABLE(
  current_user_id uuid,
  is_authenticated boolean
) 
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as current_user_id,
    (auth.uid() IS NOT NULL) as is_authenticated;
$$;

-- 5. Dar permisos adicionales a la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Enable all for authenticated users on profiles" 
  ON profiles 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 6. Verificar permisos en user_stats view
GRANT SELECT ON user_stats TO authenticated;
GRANT SELECT ON user_stats TO anon;

-- 7. Script de verificación (ejecutar después de las políticas)
-- SELECT check_auth();
-- SELECT * FROM oil_orders LIMIT 1;

NOTIFY pgrst, 'reload schema';
