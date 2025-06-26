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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Recycle,
  Package,
  CheckCircle,
  AlertCircle,
  Truck,
  Phone,
  ArrowLeft,
  User,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ordersService, OilOrder, OilOrderWithUser } from "@/lib/orders";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";

const AdminPanel = () => {
  // Handle auth errors and redirect if needed
  useAuthErrorHandler();

  const [orders, setOrders] = useState<OilOrderWithUser[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading orders from Supabase...");
      const allOrders = await ordersService.getAllOrders();
      console.log("Orders loaded successfully:", allOrders);
      setOrders(allOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      const errorMessage = error.message || "Unknown error occurred";
      setError(`Error loading orders: ${errorMessage}`);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (
    id: string,
    newStatus: OilOrder["status"],
  ) => {
    try {
      console.log(`🔄 Admin updating order ${id} to status: ${newStatus}`);

      await ordersService.updateOrderStatus(id, newStatus);

      // Reload orders after update
      await loadOrders();

      // Show success message based on status
      if (newStatus === "completed") {
        console.log(
          "✅ Order marked as completed - user dashboard will update automatically",
        );
        // Optional: Show admin feedback
        alert(
          "Order marked as completed. The user will be notified automatically.",
        );
      } else {
        console.log(`✅ Order status updated to: ${newStatus}`);
      }
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      alert(`Error updating order status: ${error.message || "Unknown error"}`);
    }
  };

  const getStatusBadge = (status: OilOrder["status"]) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: React.ReactNode;
      }
    > = {
      pending: {
        label: "Pending",
        variant: "secondary" as const,
        icon: <AlertCircle className="h-3 w-3" />,
      },
      confirmed: {
        label: "Confirmed",
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
      },
      in_progress: {
        label: "In Progress",
        variant: "outline" as const,
        icon: <Truck className="h-3 w-3" />,
      },
      completed: {
        label: "Completed",
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
      },
      cancelled: {
        label: "Cancelled",
        variant: "destructive" as const,
        icon: <AlertCircle className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status] || {
      label: status || "Unknown",
      variant: "secondary" as const,
      icon: <AlertCircle className="h-3 w-3" />,
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getWasteTypeIcon = (type: string) => {
    const icons = {
      general: "🗑️",
      recyclable: "♻️",
      organic: "🌱",
      electronics: "📱",
      hazardous: "⚠️",
    };
    return icons[type as keyof typeof icons] || "📦";
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const statusCounts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-50/30 to-trust-50/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl p-2 shadow-lg ring-2 ring-brand-100">
                <img
                  src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                  alt="Maltero Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Maltero Admin
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Request Management
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statusCounts.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.confirmed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.inProgress}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.completed}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Collection Requests</CardTitle>
                <CardDescription>
                  Manage and control all collection requests
                </CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders to display</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Oil Exchange</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="text-red-600">
                          <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                          <p>{error}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadOrders}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {order.user_name || "Usuario"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {order.user_email || "Email no disponible"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {order.pickup_date || "Not specified"}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {order.pickup_time || "Not specified"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              {order.pickup_address.length > 50
                                ? `${order.pickup_address.substring(0, 50)}...`
                                : order.pickup_address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                Used: {order.used_oil_liters}L
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                New: {order.new_oil_liters}L
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                updateOrderStatus(
                                  order.id,
                                  value as OilOrder["status"],
                                )
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">
                                  Confirmed
                                </SelectItem>
                                <SelectItem value="in_progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Order #{order.id.slice(-8)}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete order details
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                  <div className="col-span-2 p-4 bg-blue-50 rounded-lg">
                                    <Label className="text-sm font-medium text-blue-900">
                                      Customer Information
                                    </Label>
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">
                                          {order.user_name || "Usuario"}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">
                                          {order.user_email ||
                                            "Email no disponible"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Current Status
                                    </Label>
                                    <div className="mt-1">
                                      {getStatusBadge(order.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Date & Time
                                    </Label>
                                    <p className="mt-1">
                                      {order.pickup_date || "Not specified"} -{" "}
                                      {order.pickup_time || "Not specified"}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-sm font-medium">
                                      Address
                                    </Label>
                                    <p className="mt-1">
                                      {order.pickup_address}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Oil Exchange Details
                                    </Label>
                                    <div className="mt-1 space-y-2">
                                      <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                        <span className="flex items-center">
                                          <span className="mr-2">🛢️</span>
                                          Used Oil:
                                        </span>
                                        <span className="font-semibold text-red-600">
                                          {order.used_oil_liters}L
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                        <span className="flex items-center">
                                          <span className="mr-2">🆕</span>
                                          New Oil:
                                        </span>
                                        <span className="font-semibold text-green-600">
                                          {order.new_oil_liters}L
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Exchange Rate
                                    </Label>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {order.exchange_rate}:1 (
                                      {order.exchange_rate}L used = 1L new)
                                    </p>
                                  </div>
                                  {order.notes && (
                                    <div className="col-span-2">
                                      <Label className="text-sm font-medium">
                                        Notes
                                      </Label>
                                      <p className="mt-1 text-sm">
                                        {order.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={`text-sm font-medium leading-none ${className}`} {...props}>
    {children}
  </label>
);

export default AdminPanel;
