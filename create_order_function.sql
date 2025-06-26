-- FUNCIÓN RPC PARA CREAR ÓRDENES (BYPASA RLS)
-- Ejecuta este script en Supabase SQL Editor

-- 1. Crear función para insertar órdenes de forma segura
CREATE OR REPLACE FUNCTION create_oil_order(
  p_used_oil_liters integer,
  p_pickup_address text,
  p_pickup_date date DEFAULT NULL,
  p_pickup_time text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id uuid;
  new_oil_liters integer;
  result json;
BEGIN
  -- Verificar que el usuario esté autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Calcular aceite nuevo (10:1 ratio)
  new_oil_liters := FLOOR(p_used_oil_liters / 10);
  
  -- Insertar nueva orden
  INSERT INTO oil_orders (
    user_id,
    used_oil_liters,
    new_oil_liters,
    exchange_rate,
    pickup_address,
    pickup_date,
    pickup_time,
    notes,
    status
  ) VALUES (
    auth.uid(),
    p_used_oil_liters,
    new_oil_liters,
    10,
    p_pickup_address,
    p_pickup_date,
    p_pickup_time,
    p_notes,
    'pending'
  ) RETURNING id INTO new_order_id;

  -- Crear perfil si no existe
  INSERT INTO profiles (id, name)
  VALUES (auth.uid(), '')
  ON CONFLICT (id) DO NOTHING;

  -- Retornar resultado
  SELECT json_build_object(
    'id', new_order_id,
    'user_id', auth.uid(),
    'used_oil_liters', p_used_oil_liters,
    'new_oil_liters', new_oil_liters,
    'pickup_address', p_pickup_address,
    'status', 'pending',
    'created_at', NOW()
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating order: %', SQLERRM;
END;
$$;

-- 2. Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_oil_order TO authenticated;

-- 3. Función para obtener estadísticas de usuario
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  result json;
BEGIN
  -- Usar el usuario actual si no se especifica otro
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Verificar autenticación
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Solo permitir ver las propias estadísticas
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'user_id', target_user_id,
    'email', u.email,
    'name', COALESCE(p.name, u.raw_user_meta_data->>'name', 'Usuario'),
    'total_used_oil_delivered', COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.used_oil_liters ELSE 0 END), 0),
    'total_new_oil_received', COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.new_oil_liters ELSE 0 END), 0),
    'completed_orders', COUNT(CASE WHEN o.status = 'completed' THEN 1 END),
    'pending_orders', COUNT(CASE WHEN o.status = 'pending' THEN 1 END),
    'last_delivery_date', MAX(CASE WHEN o.status = 'completed' THEN o.completed_at END)
  ) INTO result
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  LEFT JOIN oil_orders o ON u.id = o.user_id
  WHERE u.id = target_user_id
  GROUP BY u.id, u.email, p.name, u.raw_user_meta_data;

  RETURN result;
END;
$$;

-- 4. Dar permisos
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;
