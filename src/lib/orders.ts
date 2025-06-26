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
  // Create new oil exchange order with fallback
  async createOrder(orderData: CreateOrderData): Promise<OilOrder> {
    if (!supabase) throw new Error("Supabase not configured");

    console.log("Creating order:", orderData);

    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc("create_oil_order", {
        p_used_oil_liters: orderData.used_oil_liters,
        p_pickup_address: orderData.pickup_address,
        p_pickup_date: orderData.pickup_date || null,
        p_pickup_time: orderData.pickup_time || null,
        p_notes: orderData.notes || null,
      });

      if (!error && data) {
        console.log("Order created successfully via RPC:", data);
        return data as OilOrder;
      }
    } catch (rpcError) {
      console.log("RPC method failed, trying direct insert:", rpcError);
    }

    try {
      // Fallback to direct insert
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const newOilLiters = Math.floor(orderData.used_oil_liters / 10);

      const { data, error } = await supabase
        .from("oil_orders")
        .insert({
          user_id: user.id,
          used_oil_liters: orderData.used_oil_liters,
          new_oil_liters: newOilLiters,
          exchange_rate: 10,
          pickup_address: orderData.pickup_address,
          pickup_date: orderData.pickup_date || null,
          pickup_time: orderData.pickup_time || null,
          notes: orderData.notes || null,
          status: "pending",
        })
        .select()
        .single();

      if (!error && data) {
        console.log("Order created successfully via direct insert:", data);
        return data;
      }
    } catch (insertError) {
      console.log(
        "Direct insert failed, using localStorage fallback:",
        insertError,
      );
    }

    // Final fallback - save to localStorage
    const orderId = crypto.randomUUID();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const order: OilOrder = {
      id: orderId,
      user_id: user?.id || "unknown",
      used_oil_liters: orderData.used_oil_liters,
      new_oil_liters: Math.floor(orderData.used_oil_liters / 10),
      exchange_rate: 10,
      pickup_address: orderData.pickup_address,
      pickup_date: orderData.pickup_date,
      pickup_time: orderData.pickup_time,
      notes: orderData.notes,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to localStorage
    const existingOrders = JSON.parse(
      localStorage.getItem("oil_orders") || "[]",
    );
    existingOrders.push(order);
    localStorage.setItem("oil_orders", JSON.stringify(existingOrders));

    console.log("Order saved to localStorage:", order);
    return order;
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
