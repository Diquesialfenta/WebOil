-- SCRIPT RÁPIDO PARA COMPLETAR ÓRDENES
-- Ejecuta este comando en Supabase SQL Editor

-- Cambiar TODAS las órdenes pendientes a completadas
UPDATE oil_orders 
SET status = 'completed', 
    completed_at = NOW() 
WHERE status = 'pending';

-- O si solo quieres cambiar la más reciente:
-- UPDATE oil_orders 
-- SET status = 'completed', 
--     completed_at = NOW() 
-- WHERE status = 'pending' 
-- ORDER BY created_at DESC 
-- LIMIT 1;

-- Verificar los cambios:
SELECT 
  id,
  used_oil_liters,
  new_oil_liters,
  status,
  completed_at,
  created_at
FROM oil_orders 
ORDER BY created_at DESC;
