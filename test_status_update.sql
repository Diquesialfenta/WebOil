-- SCRIPT PARA PROBAR ACTUALIZACIONES AUTOMÁTICAS
-- Ejecuta estos comandos uno por uno en Supabase SQL Editor

-- 1. Ver órdenes actuales
SELECT 
  id,
  user_id,
  used_oil_liters,
  new_oil_liters,
  status,
  completed_at,
  created_at
FROM oil_orders 
ORDER BY created_at DESC;

-- 2. Cambiar una orden de pending a completed
UPDATE oil_orders 
SET status = 'completed', 
    completed_at = NOW() 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 1;

-- 3. Verificar el cambio
SELECT 
  id,
  user_id,
  used_oil_liters,
  new_oil_liters,
  status,
  completed_at
FROM oil_orders 
WHERE status = 'completed'
ORDER BY completed_at DESC;

-- 4. Ver estadísticas calculadas para el usuario
-- Reemplaza 'USER_ID_AQUI' con el user_id real de la orden
/*
SELECT 
  user_id,
  SUM(CASE WHEN status = 'completed' THEN used_oil_liters ELSE 0 END) as total_used_oil,
  SUM(CASE WHEN status = 'completed' THEN new_oil_liters ELSE 0 END) as total_new_oil,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM oil_orders 
WHERE user_id = 'USER_ID_AQUI'
GROUP BY user_id;
*/
