import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Droplets,
  Gift,
  Calendar,
  TrendingUp,
  Award,
  Recycle,
  Phone,
  Settings,
  Edit,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService, UserStats, OilOrder } from "@/lib/orders";
import { supabase } from "@/lib/supabase";
import { DatabaseSetupInfo } from "@/components/DatabaseSetupInfo";
import { DebugInfo } from "@/components/DebugInfo";
import { UpdateNotification } from "@/components/UpdateNotification";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Handle auth errors and redirect if needed
  useAuthErrorHandler();

  // Real user data from Supabase
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userOrders, setUserOrders] = useState<OilOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<string>("disconnected");

  // Static address for now - can be made dynamic later
  const defaultAddress =
    "No. 1, Tal-Barrani Industrial Park, Triq il-Belt Valletta, Ghaxaq, Malta";

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Load real user data from Supabase
  const loadUserData = async (showNotification = false) => {
    if (!user) return;

    setIsLoadingData(true);
    try {
      console.log("🔄 Loading user data for:", user.id);

      // Load user statistics and orders in parallel for better performance
      const [stats, orders] = await Promise.all([
        ordersService.getUserStats(user.id),
        ordersService.getUserOrders(user.id),
      ]);

      console.log("📊 Loaded stats:", stats);
      console.log("📦 Loaded orders:", orders);

      // Detailed logging for completed orders
      const completedOrders =
        orders?.filter((order) => order.status === "completed") || [];
      console.log("✅ Completed orders:", completedOrders);
      console.log("📈 Statistics breakdown:", {
        total_used_oil: stats?.total_used_oil_delivered || 0,
        total_new_oil: stats?.total_new_oil_received || 0,
        completed_count: stats?.completed_orders || 0,
        last_delivery: stats?.last_delivery_date || null,
      });

      setUserStats(stats);
      setUserOrders(orders);
      setShowDebugInfo(false); // Hide debug info on successful load

      // Show update notification if requested (manual refresh)
      if (showNotification) {
        setUpdateMessage("¡Dashboard actualizado con los últimos datos!");
        setShowUpdateNotification(true);
      }
    } catch (error: any) {
      console.error("Error loading user data:", error);

      // Better error logging
      const errorDetails = {
        message: error?.message || "Unknown error",
        code: error?.code || "No code",
        details: error?.details || "No details",
        hint: error?.hint || "No hint",
        stack: error?.stack || "No stack",
      };
      console.error("Error details:", errorDetails);

      // More specific error messages
      let errorMessage = "Unknown error occurred";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error(`Specific error: ${errorMessage}`);

      // Tables should exist now, but keep fallback just in case
      if (
        error?.code === "42P01" ||
        error?.message?.includes("relation") ||
        error?.message?.includes("does not exist")
      ) {
        setShowDatabaseSetup(true);
        console.error("Database tables missing - showing setup instructions");
      }

      // Check for authentication issues
      if (error?.code === "PGRST301" || error?.message?.includes("JWT")) {
        console.error("Authentication issue detected");
      }

      // Show debug info for persistent errors
      setShowDebugInfo(true);

      // Set default stats if error
      setUserStats({
        user_id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || "Usuario",
        total_used_oil_delivered: 0,
        total_new_oil_received: 0,
        completed_orders: 0,
        pending_orders: 0,
        last_delivery_date: null,
      });
      setUserOrders([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Set up real-time subscription for order updates
  useEffect(() => {
    if (!user || !supabase) return;

    console.log("Setting up real-time subscription for user:", user.id);

    // Listen to database changes on oil_orders table for this user
    const ordersChannel = supabase
      .channel(`oil_orders_user_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "oil_orders",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("🔔 Database change detected for user orders:", payload);

          // Handle ANY status change - orders must update immediately
          if (
            payload.eventType === "UPDATE" &&
            payload.new?.status !== payload.old?.status
          ) {
            console.log(
              `✅ Order status changed from ${payload.old?.status} to ${payload.new?.status}, refreshing dashboard...`,
            );

            let message = "";

            // Different messages based on status change
            if (payload.new?.status === "completed") {
              const newOil = payload.new.new_oil_liters || 0;
              message = `¡Tu pedido ha sido completado! Recibiste ${newOil}L de aceite nuevo.`;
            } else if (payload.new?.status === "confirmed") {
              message = `¡Tu pedido ha sido confirmado! El proceso está en marcha.`;
            } else if (payload.new?.status === "in_progress") {
              message = `¡Tu pedido está en proceso! Estamos trabajando en él.`;
            } else if (payload.new?.status === "cancelled") {
              message = `Tu pedido ha sido cancelado. Contáctanos si tienes dudas.`;
            } else {
              message = `Estado de tu pedido actualizado: ${payload.new?.status}`;
            }

            setUpdateMessage(message);
            setShowUpdateNotification(true);

            // ALWAYS refresh data when status changes
            await loadUserData();
          } else if (payload.eventType === "INSERT") {
            // New order created, refresh without notification
            console.log("New order created, refreshing data...");
            await loadUserData();
          }
        },
      )
      .subscribe((status) => {
        console.log("📡 Real-time subscription status:", status);
        setRealtimeStatus(status.toLowerCase());
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to real-time updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Error subscribing to real-time updates");
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log("🧹 Cleaning up real-time subscription");
      if (supabase) {
        supabase.removeChannel(ordersChannel);
      }
    };
  }, [user]);

  // Auto-refresh every 30 seconds (existing functionality)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log("Auto-refreshing user data...");
      loadUserData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadUserData(true); // Pass true to show notification
    } catch (error) {
      console.error("Error refreshing data:", error);
      setUpdateMessage("Error al actualizar los datos. Inténtalo de nuevo.");
      setShowUpdateNotification(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate progress towards next reward (every 1000L) using real data
  const litrosEntregados = userStats?.total_used_oil_delivered || 0;
  const litrosCanjeados = userStats?.total_new_oil_received || 0;
  const progresoHaciaPremio = (litrosEntregados % 1000) / 10; // Convert to percentage
  const litrosParaPremio = 1000 - (litrosEntregados % 1000);
  const availableNewOil = Math.floor(litrosEntregados / 10) - litrosCanjeados;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-50/30 to-trust-50/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="transition-transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl p-2 shadow-lg ring-2 ring-brand-100 animate-float">
                <img
                  src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                  alt="Maltero Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Maltero</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  User Dashboard
                </p>
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:flex">
              <Phone className="h-3 w-3 mr-1" />
              +356 9919 0222
            </Badge>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Actualizando..." : "Actualizar"}
              </Button>

              {/* Real-time status indicator */}
              <div
                className={`flex items-center space-x-1 text-xs ${
                  realtimeStatus === "subscribed"
                    ? "text-green-600"
                    : realtimeStatus === "connecting"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    realtimeStatus === "subscribed"
                      ? "bg-green-500"
                      : realtimeStatus === "connecting"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                ></div>
                <span className="text-muted-foreground">
                  {realtimeStatus === "subscribed"
                    ? "En línea"
                    : realtimeStatus === "connecting"
                      ? "Conectando..."
                      : "Desconectado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {/* Background Logo */}
              <div className="absolute top-4 right-4 opacity-10">
                <img
                  src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                  alt="Maltero Background"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  ¡Bienvenido, {user?.user_metadata?.name || "Usuario"}!
                </h2>
                <p className="text-white/90 mb-4">
                  Tu centro de control para el programa de intercambio de aceite
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Malta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="mb-8">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-brand-700">
                  Estadísticas de Intercambio
                </CardTitle>
                <CardDescription>
                  Resumen de tus intercambios de aceite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Litros Entregados */}
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Droplets className="h-6 w-6 text-white" />
                    </div>
                    <div
                      className="text-3xl font-bold text-red-600"
                      id="litrosEntregados"
                    >
                      {isLoadingData ? "..." : `${litrosEntregados}L`}
                    </div>
                    <p className="text-sm font-medium text-red-700">
                      Litros de aceite entregados
                    </p>
                  </div>

                  {/* Litros Canjeados */}
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Recycle className="h-6 w-6 text-white" />
                    </div>
                    <div
                      className="text-3xl font-bold text-green-600"
                      id="litrosCanjeados"
                    >
                      {isLoadingData ? "..." : `${litrosCanjeados}L`}
                    </div>
                    <p className="text-sm font-medium text-green-700">
                      Litros de aceite nuevo obtenidos
                    </p>
                  </div>

                  {/* Última Entrega */}
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div
                      className="text-lg font-bold text-blue-600"
                      id="ultimaEntrega"
                    >
                      {isLoadingData
                        ? "..."
                        : userStats?.last_delivery_date
                          ? formatearFecha(
                              userStats.last_delivery_date.split("T")[0],
                            )
                          : "Sin entregas"}
                    </div>
                    <p className="text-sm font-medium text-blue-700">
                      Última entrega
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress towards Reward */}
          <div className="mb-8">
            <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Gift className="h-6 w-6" />
                  <span>Progreso hacia el próximo premio</span>
                </CardTitle>
                <CardDescription>
                  Cada 1000L entregados recibes un premio especial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-600">
                      Progreso actual
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {litrosEntregados}/1000L
                    </span>
                  </div>
                  <Progress
                    value={progresoHaciaPremio}
                    className="h-3 bg-white/50"
                  />
                  <div className="text-center">
                    <p className="text-sm text-purple-600">
                      Te faltan{" "}
                      <span className="font-bold">{litrosParaPremio}L</span>{" "}
                      para tu próximo premio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Make New Request */}
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-brand-600" />
                </div>
                <CardTitle className="text-brand-700">
                  Nuevo Intercambio
                </CardTitle>
                <CardDescription>
                  Solicita la recolección de aceite usado
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link to="/">
                  <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                    <Droplets className="h-4 w-4 mr-2" />
                    Hacer Solicitud
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Available Oil */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-700">
                  Aceite Disponible
                </CardTitle>
                <CardDescription>
                  Aceite nuevo listo para recoger
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(litrosEntregados * 0.95)}L
                  </p>
                  <p className="text-sm text-green-600">
                    disponibles para recoger
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar para Recoger
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-brand-600" />
                <span>Solicitudes Recientes</span>
              </CardTitle>
              <CardDescription>
                Historial de tus últimas solicitudes de intercambio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Cargando solicitudes...
                  </p>
                </div>
              ) : userOrders && userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            order.status === "completed"
                              ? "bg-green-500"
                              : order.status === "pending"
                                ? "bg-yellow-500"
                                : order.status === "confirmed"
                                  ? "bg-blue-500"
                                  : "bg-gray-400"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium">
                            {order.used_oil_liters}L aceite usado →{" "}
                            {order.new_oil_liters}L aceite nuevo
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.pickup_date || "Fecha por confirmar"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status === "completed"
                          ? "Completado"
                          : order.status === "pending"
                            ? "Pendiente"
                            : order.status === "confirmed"
                              ? "Confirmado"
                              : order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes solicitudes aún</p>
                  <p className="text-sm">
                    ¡Haz tu primera solicitud de intercambio!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="mt-8">
            <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Phone className="h-6 w-6" />
                  <span>Información de Contacto</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-blue-700">Teléfono</p>
                    <p className="text-blue-600">+356 9919 0222</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Email</p>
                    <p className="text-blue-600">malteromalta@gmail.com</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-blue-700">Dirección</p>
                    <p className="text-blue-600">{defaultAddress}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-blue-700">
                      Permiso Ambiental No. 017/16/A
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
            </Button>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Conditional Components */}
      {showUpdateNotification && (
        <UpdateNotification
          message={updateMessage}
          onClose={() => setShowUpdateNotification(false)}
        />
      )}

      {showDatabaseSetup && <DatabaseSetupInfo />}

      {showDebugInfo && (
        <DebugInfo
          userStats={userStats}
          userOrders={userOrders}
          user={user}
          onClose={() => setShowDebugInfo(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
