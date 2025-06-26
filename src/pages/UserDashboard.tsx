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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService, UserStats, OilOrder } from "@/lib/orders";
import { DatabaseSetupInfo } from "@/components/DatabaseSetupInfo";

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Real user data from Supabase
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userOrders, setUserOrders] = useState<OilOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      setIsLoadingData(true);
      try {
        console.log("Loading user data for:", user.id);

        // Load user statistics and orders
        const [stats, orders] = await Promise.all([
          ordersService.getUserStats(user.id),
          ordersService.getUserOrders(user.id),
        ]);

        console.log("Loaded stats:", stats);
        console.log("Loaded orders:", orders);

        setUserStats(stats);
        setUserOrders(orders);
      } catch (error) {
        console.error("Error loading user data:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

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

    loadUserData();
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);

  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Calculate progress towards next reward (every 1000L) using real data
  const litrosEntregados = userStats?.total_used_oil_delivered || 0;
  const litrosCanjeados = userStats?.total_new_oil_received || 0;
  const progresoHaciaPremio = (litrosEntregados % 1000) / 10; // Convert to percentage
  const litrosParaPremio = 1000 - (litrosEntregados % 1000);
  const availableNewOil = Math.floor(litrosEntregados / 10) - litrosCanjeados;

  // Create real oil request order
  const handleSolicitarAceite = async () => {
    if (!user || !userStats) return;

    setIsLoading(true);
    try {
      // Calculate available new oil based on delivered oil
      const availableNewOil =
        Math.floor(userStats.total_used_oil_delivered / 10) -
        userStats.total_new_oil_received;

      if (availableNewOil <= 0) {
        alert(
          "No tienes aceite nuevo disponible para solicitar. Entrega más aceite usado primero.",
        );
        return;
      }

      // Create delivery request
      await ordersService.createOrder({
        used_oil_liters: 0, // This is a delivery request, not pickup
        pickup_address: defaultAddress,
        pickup_date: new Date().toISOString().split("T")[0],
        notes: `Solicitud de entrega de ${availableNewOil}L de aceite nuevo`,
      });

      alert(
        `¡Solicitud enviada! Te contactaremos pronto para coordinar la entrega de ${availableNewOil}L de aceite nuevo.`,
      );

      // Reload data
      const [stats, orders] = await Promise.all([
        ordersService.getUserStats(user.id),
        ordersService.getUserOrders(user.id),
      ]);
      setUserStats(stats);
      setUserOrders(orders);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error al enviar solicitud. Intenta nuevamente.");
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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Home
              </Button>
            </Link>
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
                  className="w-24 h-24 object-contain animate-float flex md:flex sm:flex"
                />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h1
                    id="saludoUsuario"
                    className="text-2xl md:text-3xl font-bold mb-2"
                  >
                    Hola,{" "}
                    <span id="nombreUsuario">
                      {userStats?.name ||
                        user?.user_metadata?.name ||
                        "Usuario"}
                    </span>
                    ! 👋
                  </h1>
                  <p className="text-white/90 text-lg">
                    Bienvenido a tu panel de intercambio de aceite
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Datos Personales */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-trust-600" />
                    Datos Personales
                  </CardTitle>
                  <CardDescription>Tu información de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Nombre completo
                        </p>
                        <p
                          id="nombreCompleto"
                          className="text-base font-semibold text-foreground"
                        >
                          {userStats?.name ||
                            user?.user_metadata?.name ||
                            "Usuario"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Correo electrónico
                        </p>
                        <p
                          id="emailUsuario"
                          className="text-base font-semibold text-foreground"
                        >
                          {userStats?.email || user?.email || "No especificado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Dirección
                        </p>
                        <p
                          id="direccionUsuario"
                          className="text-base font-semibold text-foreground"
                        >
                          {defaultAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Actividad y Estadísticas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Estadísticas Principales */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-brand-600" />
                    Tu Actividad de Intercambio
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

              {/* Programa de Fidelidad */}
              <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Programa de Fidelidad
                  </CardTitle>
                  <CardDescription>
                    Progreso hacia tu próximo premio especial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Progreso hacia 1000L
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {litrosEntregados}/1000L
                    </span>
                  </div>

                  <Progress value={progresoHaciaPremio} className="h-3" />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Faltan {litrosParaPremio}L para tu próximo premio
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      Premio: Sorpresa especial
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Botón de Solicitud */}
              {availableNewOil > 0 && (
                <Card className="shadow-xl border-0 bg-gradient-to-r from-brand-100 to-brand-50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="bg-brand-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        <Droplets className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          ¿Tienes aceite nuevo disponible?
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Solicita la entrega de tu aceite nuevo basado en tus
                          intercambios anteriores
                        </p>
                      </div>

                      <Button
                        id="botonCanje"
                        onClick={handleSolicitarAceite}
                        disabled={isLoading}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 text-lg h-14"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Enviando solicitud...
                          </div>
                        ) : (
                          <>
                            <Gift className="h-5 w-5 mr-2" />
                            Solicitar aceite nuevo
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        * Basado en tu ratio de intercambio actual:{" "}
                        {availableNewOil}L disponibles
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/80 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-trust-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Recycle className="h-6 w-6 text-trust-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Ratio de Intercambio</h3>
                  <p className="text-2xl font-bold text-trust-600">10:1</p>
                  <p className="text-sm text-muted-foreground">
                    10L aceite usado = 1L aceite nuevo
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Impacto Ambiental</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(litrosEntregados * 0.95)}L
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aceite reciclado correctamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
