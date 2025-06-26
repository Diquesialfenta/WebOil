-- SOLUCIÓN DE EMERGENCIA - DESHABILITAR RLS TEMPORALMENTE
-- Ejecuta este script AHORA en tu Supabase SQL Editor

-- 1. Deshabilitar RLS en oil_orders (temporal)
ALTER TABLE oil_orders DISABLE ROW LEVEL SECURITY;

-- 2. Deshabilitar RLS en profiles (temporal)  
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que las tablas existan
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('oil_orders', 'profiles', 'loyalty_rewards');

-- 4. Verificar estructura de oil_orders
\d oil_orders;

-- DESPUÉS DE EJECUTAR ESTO, EL FORMULARIO DEBERÍA FUNCIONAR
-- Nota: Esto es temporal para debugging - reactivaremos RLS después
