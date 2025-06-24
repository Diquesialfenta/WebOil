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
} from "lucide-react";
import { Link } from "react-router-dom";

export interface WasteRequest {
  id: string;
  date: string;
  time: string;
  wasteType: string;
  address: string;
  notes: string;
  usedOilLiters?: number;
  newOilLiters?: number;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  customerPhone?: string;
  estimatedWeight?: string;
}

const AdminPanel = () => {
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    // Load requests from localStorage
    const savedRequests = localStorage.getItem("wasteRequests");
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
  }, []);

  const updateRequestStatus = (
    id: string,
    newStatus: WasteRequest["status"],
  ) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req,
    );
    setRequests(updatedRequests);
    localStorage.setItem("wasteRequests", JSON.stringify(updatedRequests));
  };

  const getStatusBadge = (status: WasteRequest["status"]) => {
    const statusConfig = {
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
      "in-progress": {
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

    const config = statusConfig[status];
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

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((req) => req.status === filterStatus);

  const statusCounts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    confirmed: requests.filter((r) => r.status === "confirmed").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
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
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No requests to display</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Oil Exchange</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        #{request.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{request.date}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {request.time}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="max-w-[200px] truncate">
                            {request.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🛢️</span>
                            <span className="font-medium text-red-600">
                              {request.usedOilLiters || 0}L Used
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">✨</span>
                            <span className="font-medium text-green-600">
                              {request.newOilLiters || 0}L New
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Request #{request.id.slice(-8)}
                                </DialogTitle>
                                <DialogDescription>
                                  Complete request details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    Current Status
                                  </Label>
                                  <div className="mt-1">
                                    {getStatusBadge(request.status)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Date & Time
                                  </Label>
                                  <p className="mt-1">
                                    {request.date} - {request.time}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-sm font-medium">
                                    Address
                                  </Label>
                                  <p className="mt-1">{request.address}</p>
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
                                        {request.usedOilLiters || 0}L
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                      <span className="flex items-center">
                                        <span className="mr-2">✨</span>
                                        New Oil (FREE):
                                      </span>
                                      <span className="font-semibold text-green-600">
                                        {request.newOilLiters || 0}L
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Created
                                  </Label>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {new Date(
                                      request.createdAt,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                {request.notes && (
                                  <div className="col-span-2">
                                    <Label className="text-sm font-medium">
                                      Notes
                                    </Label>
                                    <p className="mt-1 text-sm">
                                      {request.notes}
                                    </p>
                                  </div>
                                )}
                                <div className="col-span-2 border-t pt-4">
                                  <Label className="text-sm font-medium">
                                    Update Status
                                  </Label>
                                  <Select
                                    value={request.status}
                                    onValueChange={(value) =>
                                      updateRequestStatus(
                                        request.id,
                                        value as WasteRequest["status"],
                                      )
                                    }
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        Pending
                                      </SelectItem>
                                      <SelectItem value="confirmed">
                                        Confirmed
                                      </SelectItem>
                                      <SelectItem value="in-progress">
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
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
