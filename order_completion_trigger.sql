-- SQL trigger to notify when orders are completed
-- Run this in your Supabase SQL Editor

-- Create a function that will be called when an order is updated
CREATE OR REPLACE FUNCTION notify_order_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the order status changed to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Send a notification via pg_notify
    PERFORM pg_notify(
      'order_completed',
      json_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'used_oil_liters', NEW.used_oil_liters,
        'new_oil_liters', NEW.new_oil_liters,
        'completed_at', NEW.completed_at
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS order_completion_notify ON oil_orders;
CREATE TRIGGER order_completion_notify
  AFTER UPDATE ON oil_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_completion();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON oil_orders TO authenticated;
