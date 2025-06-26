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
  // Create new oil exchange order
  async createOrder(orderData: CreateOrderData): Promise<OilOrder> {
    if (!supabase) throw new Error("Supabase not configured");

    const newOilLiters = Math.floor(orderData.used_oil_liters / 10);

    const { data, error } = await supabase
      .from("oil_orders")
      .insert({
        ...orderData,
        new_oil_liters: newOilLiters,
        exchange_rate: 10,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's orders
  async getUserOrders(userId?: string): Promise<OilOrder[]> {
    if (!supabase) throw new Error("Supabase not configured");

    let query = supabase
      .from("oil_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
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
