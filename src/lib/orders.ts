import { supabase } from "./supabase";

export interface OilOrder {
  id: string;
  user_id: string;
  used_oil_liters: number;
  new_oil_liters: number;
  exchange_rate: number;
  pickup_address: string;
  pickup_date?: string;
  pickup_time?: string;
  notes?: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateOrderData {
  used_oil_liters: number;
  pickup_address: string;
  pickup_date?: string;
  pickup_time?: string;
  notes?: string;
}

export interface UserStats {
  user_id: string;
  email: string;
  name: string;
  total_used_oil_delivered: number;
  total_new_oil_received: number;
  completed_orders: number;
  pending_orders: number;
  last_delivery_date: string | null;
}

export const ordersService = {
  // Create new oil exchange order using RPC function
  async createOrder(orderData: CreateOrderData): Promise<OilOrder> {
    if (!supabase) throw new Error("Supabase not configured");

    console.log("Creating order with RPC function:", orderData);

    const { data, error } = await supabase.rpc("create_oil_order", {
      p_used_oil_liters: orderData.used_oil_liters,
      p_pickup_address: orderData.pickup_address,
      p_pickup_date: orderData.pickup_date || null,
      p_pickup_time: orderData.pickup_time || null,
      p_notes: orderData.notes || null,
    });

    if (error) {
      console.error("RPC order creation error:", error);
      throw error;
    }

    console.log("Order created successfully via RPC:", data);
    return data as OilOrder;
  },

  // Get user's orders
  async getUserOrders(userId?: string): Promise<OilOrder[]> {
    if (!supabase) throw new Error("Supabase not configured");

    try {
      let query = supabase
        .from("oil_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.log("getUserOrders error:", error);

        // If table doesn't exist, return empty array
        if (error.code === "42P01") {
          console.log("oil_orders table does not exist, returning empty array");
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return [];
    }
  },

  // Get user statistics
  async getUserStats(userId?: string): Promise<UserStats | null> {
    if (!supabase) throw new Error("Supabase not configured");

    try {
      let query = supabase.from("user_stats").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.log("getUserStats error:", error);

        // If no data found or view doesn't exist, return default stats
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.log(
            "No stats found or table missing, returning default stats",
          );
          return {
            user_id: userId || "",
            email: "",
            name: "",
            total_used_oil_delivered: 0,
            total_new_oil_received: 0,
            completed_orders: 0,
            pending_orders: 0,
            last_delivery_date: null,
          };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserStats:", error);
      // Return default stats for any error
      return {
        user_id: userId || "",
        email: "",
        name: "",
        total_used_oil_delivered: 0,
        total_new_oil_received: 0,
        completed_orders: 0,
        pending_orders: 0,
        last_delivery_date: null,
      };
    }
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OilOrder["status"],
  ): Promise<OilOrder> {
    if (!supabase) throw new Error("Supabase not configured");

    const updateData: any = { status };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("oil_orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all orders (admin only)
  async getAllOrders(): Promise<OilOrder[]> {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("oil_orders")
      .select(
        `
        *,
        profiles!oil_orders_user_id_fkey (
          name,
          address,
          phone
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update user profile
  async updateProfile(profileData: {
    name?: string;
    address?: string;
    phone?: string;
  }) {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
