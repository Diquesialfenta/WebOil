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

export interface OilOrderWithUser extends OilOrder {
  user_email?: string;
  user_name?: string;
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
  // Create new oil exchange order (database should be configured now)
  async createOrder(orderData: CreateOrderData): Promise<OilOrder> {
    if (!supabase) throw new Error("Supabase not configured");

    console.log("Creating order:", orderData);

    // Get current user first
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const newOilLiters = Math.floor(orderData.used_oil_liters / 10);

    // Try direct insert (tables should exist now)
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

    if (error) {
      console.error("Error creating order in Supabase:", error);
      throw error;
    }

    console.log("Order created successfully in Supabase:", data);
    return data;
  },

  // Get user's orders (database should be configured now)
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

    if (error) {
      console.error("Error loading orders from Supabase:", error);
      throw error;
    }

    console.log("Orders loaded from Supabase:", data);
    return data || [];
  },

  // Get user statistics (calculate from orders directly)
  async getUserStats(userId?: string): Promise<UserStats | null> {
    if (!supabase) throw new Error("Supabase not configured");

    try {
      // Get current user info
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error("No user ID available");
      }

      // Get user orders directly from oil_orders table
      const { data: orders, error: ordersError } = await supabase
        .from("oil_orders")
        .select("*")
        .eq("user_id", targetUserId);

      if (ordersError) {
        console.error("Error loading user orders:", ordersError);
        throw ordersError;
      }

      // Calculate statistics from orders
      const completedOrders =
        orders?.filter((order) => order.status === "completed") || [];
      const pendingOrders =
        orders?.filter((order) => order.status === "pending") || [];

      const totalUsedOil = completedOrders.reduce(
        (sum, order) => sum + (order.used_oil_liters || 0),
        0,
      );
      const totalNewOil = completedOrders.reduce(
        (sum, order) => sum + (order.new_oil_liters || 0),
        0,
      );

      const lastDelivery = completedOrders
        .filter((order) => order.completed_at)
        .sort(
          (a, b) =>
            new Date(b.completed_at!).getTime() -
            new Date(a.completed_at!).getTime(),
        )[0];

      const stats: UserStats = {
        user_id: targetUserId,
        email: user?.email || "",
        name: user?.user_metadata?.name || "Usuario",
        total_used_oil_delivered: totalUsedOil,
        total_new_oil_received: totalNewOil,
        completed_orders: completedOrders.length,
        pending_orders: pendingOrders.length,
        last_delivery_date: lastDelivery?.completed_at || null,
      };

      console.log("Stats calculated successfully:", stats);
      return stats;
    } catch (error: any) {
      console.error("getUserStats error:", error);

      // Return default stats for any error
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return {
        user_id: userId || user?.id || "",
        email: user?.email || "",
        name: user?.user_metadata?.name || "Usuario",
        total_used_oil_delivered: 0,
        total_new_oil_received: 0,
        completed_orders: 0,
        pending_orders: 0,
        last_delivery_date: null,
      };
    }
  },
  async updateOrderStatus(
    orderId: string,
    status: OilOrder["status"],
  ): Promise<OilOrder> {
    if (!supabase) throw new Error("Supabase not configured");

    console.log(`Updating order ${orderId} to status: ${status}`);

    const updateData: any = { status };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
      console.log(
        "Order being marked as completed, setting completed_at timestamp",
      );
    }

    const { data, error } = await supabase
      .from("oil_orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      throw error;
    }

    console.log("Order status updated successfully:", data);

    // If order was marked as completed, log the user impact
    if (status === "completed" && data) {
      console.log(`Order completed for user ${data.user_id}:`, {
        used_oil_added: data.used_oil_liters,
        new_oil_earned: data.new_oil_liters,
        user_id: data.user_id,
      });

      // Trigger real-time notification for user dashboard updates
      try {
        // Send a custom event that can be listened to by user dashboards
        const notificationPayload = {
          type: "ORDER_COMPLETED",
          order_id: orderId,
          user_id: data.user_id,
          used_oil_liters: data.used_oil_liters,
          new_oil_liters: data.new_oil_liters,
          timestamp: new Date().toISOString(),
        };

        // Use Supabase realtime to broadcast the change
        await supabase.channel("order_updates").send({
          type: "broadcast",
          event: "order_completed",
          payload: notificationPayload,
        });

        console.log("Real-time notification sent:", notificationPayload);
      } catch (realtimeError) {
        console.error("Error sending real-time notification:", realtimeError);
        // Don't fail the order update if notification fails
      }
    }

    return data;
  },

  // Get all orders (admin only)
  async getAllOrders(): Promise<OilOrderWithUser[]> {
    if (!supabase) throw new Error("Supabase not configured");

    try {
      // First try to get orders with user profile information via JOIN
      const { data: ordersWithProfiles, error: joinError } = await supabase
        .from("oil_orders")
        .select(
          `
          *,
          profiles!inner(email, name)
        `,
        )
        .order("created_at", { ascending: false });

      // If the JOIN works (profiles table exists and has data)
      if (!joinError && ordersWithProfiles) {
        const ordersWithUserInfo = ordersWithProfiles.map((order) => ({
          ...order,
          user_email: order.profiles?.email || "",
          user_name: order.profiles?.name || "Usuario",
          profiles: undefined, // Remove the nested profiles object
        }));
        console.log("getAllOrders with user info:", ordersWithUserInfo);
        return ordersWithUserInfo;
      }

      // Fallback: get orders and manually fetch user info from auth
      console.log(
        "Profiles table not available, fetching user info manually...",
      );
      const { data: orders, error } = await supabase
        .from("oil_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getAllOrders error:", error);
        throw error;
      }

      // For each order, try to get user info from auth.users (if accessible)
      const ordersWithUserInfo = await Promise.all(
        (orders || []).map(async (order) => {
          try {
            // Try to get user metadata from auth
            const { data: userData, error: userError } =
              await supabase.auth.admin.getUserById(order.user_id);

            return {
              ...order,
              user_email: userData?.user?.email || "Email no disponible",
              user_name: userData?.user?.user_metadata?.name || "Usuario",
            };
          } catch (userError) {
            // If can't access user data, use defaults
            return {
              ...order,
              user_email: "Email no disponible",
              user_name: "Usuario",
            };
          }
        }),
      );

      console.log("getAllOrders with manual user info:", ordersWithUserInfo);
      return ordersWithUserInfo;
    } catch (error) {
      console.error("Error in getAllOrders:", error);

      // Final fallback: return orders without user info
      const { data, error: fallbackError } = await supabase
        .from("oil_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallbackError) throw fallbackError;

      return (data || []).map((order) => ({
        ...order,
        user_email: "Email no disponible",
        user_name: "Usuario",
      }));
    }
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
