import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Recycle,
  Truck,
  Shield,
  Phone,
  Star,
  CheckCircle,
  Leaf,
  Users,
  Timer,
  Settings,
  ArrowRight,
  Gift,
  Calculator,
  Droplets,
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [wasteType, setWasteType] = useState("oil");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [usedOilLiters, setUsedOilLiters] = useState("");

  const generateRequestId = () => {
    return (
      "REQ-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).substr(2, 9)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestId = generateRequestId();
    const newOilLiters = Math.floor(parseInt(usedOilLiters || "0") / 10);

    const newRequest = {
      id: requestId,
      date: selectedDate,
      time: selectedTime,
      wasteType,
      address,
      notes,
      usedOilLiters: parseInt(usedOilLiters || "0"),
      newOilLiters,
      status: "pending" as const,
      createdAt: new Date(),
    };

    // Save to localStorage (in production, this would be sent to your backend)
    const existingRequests = JSON.parse(
      localStorage.getItem("wasteRequests") || "[]",
    );
    const updatedRequests = [...existingRequests, newRequest];
    localStorage.setItem("wasteRequests", JSON.stringify(updatedRequests));

    console.log("New exchange request:", newRequest);

    alert(
      `Exchange Request Submitted!\n\nRequest ID: ${requestId.slice(-8)}\n\nYou'll receive: ${newOilLiters}L of new oil\nFor: ${usedOilLiters}L of used oil\n\nWe'll contact you soon to schedule the exchange!`,
    );

    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setWasteType("oil");
    setAddress("");
    setNotes("");
    setUsedOilLiters("");
  };

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
  ];

  const calculateNewOil = (usedLiters: string) => {
    const used = parseInt(usedLiters) || 0;
    return Math.floor(used / 10);
  };

  const calculateLoyaltyProgress = (usedLiters: string) => {
    const used = parseInt(usedLiters) || 0;
    return used % 1000;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-50/30 to-trust-50/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl p-2 shadow-lg ring-2 ring-brand-100">
              <img
                src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                alt="Maltero Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Maltero</h1>
              <p className="text-sm text-muted-foreground font-medium">
                Oil Exchange Program
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="hidden sm:flex">
              <Phone className="h-3 w-3 mr-1" />
              +356 9919 0222
            </Badge>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Super Direct Value Proposition */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Value Proposition */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
              {/* Floating Logo Background */}
              <div className="absolute top-4 right-4 opacity-10">
                <img
                  src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                  alt="Maltero Background"
                  className="w-24 h-24 object-contain animate-float"
                />
              </div>
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 rounded-full p-4 ring-4 ring-white/30">
                  <img
                    src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                    alt="Maltero Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Get New Oil for FREE!
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-white/90">
                Exchange your used oil for fresh, new oil at no cost
              </p>

              {/* Exchange Rate Display */}
              <div className="bg-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold">10L</div>
                    <div className="text-sm opacity-90">Used Oil</div>
                  </div>
                  <div className="text-center">
                    <ArrowRight className="h-8 w-8 mx-auto" />
                    <div className="text-xs mt-1 opacity-75">Exchange</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-300">1L</div>
                    <div className="text-sm opacity-90">New Oil FREE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-0 shadow-lg bg-white/90 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">100% FREE</h3>
                  <p className="text-muted-foreground">
                    No hidden costs. Just bring your used oil and get new oil
                    for free!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Door-to-Door</h3>
                  <p className="text-muted-foreground">
                    We come to you! Schedule pickup and delivery at your
                    location.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Loyalty Rewards
                  </h3>
                  <p className="text-muted-foreground">
                    Get special prizes for every 1000L of oil exchanged!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              className="bg-brand-600 hover:bg-brand-700 text-white px-12 py-4 text-xl rounded-full shadow-lg"
              onClick={() =>
                document
                  .getElementById("exchange-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Calculator className="h-6 w-6 mr-2" />
              Start Your Exchange Now
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Simple & Clear */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How Does It Work?
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple, transparent, and eco-friendly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "You Have Used Oil",
                description:
                  "Collect your used motor oil from cars, motorcycles, or machinery",
                icon: <Droplets className="h-8 w-8" />,
                color: "bg-red-500",
              },
              {
                step: "2",
                title: "Schedule Exchange",
                description:
                  "Book a pickup time that works for you using our simple form",
                icon: <Calendar className="h-8 w-8" />,
                color: "bg-blue-500",
              },
              {
                step: "3",
                title: "We Pick Up & Measure",
                description:
                  "Our team collects your used oil and measures the exact amount",
                icon: <Truck className="h-8 w-8" />,
                color: "bg-orange-500",
              },
              {
                step: "4",
                title: "Get Fresh Oil FREE",
                description:
                  "Receive new, high-quality oil based on our 10:1 exchange rate",
                icon: <Gift className="h-8 w-8" />,
                color: "bg-green-500",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div
                    className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto shadow-lg`}
                  >
                    {item.step}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Calculator & Form */}
      <section id="exchange-form" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Calculate Your Exchange
            </h2>
            <p className="text-lg text-muted-foreground">
              See exactly how much new oil you'll receive
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
              {/* Background Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <img
                  src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                  alt="Maltero Background"
                  className="object-contain"
                  style={{
                    width: "316px",
                    height: "602px",
                    paddingTop: "73px",
                  }}
                />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Exchange Calculator
                </CardTitle>
                <CardDescription>
                  Enter your used oil amount to see what you'll get
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div>
                  <Label
                    htmlFor="calculator-input"
                    className="text-base font-medium"
                  >
                    Used Oil Amount (Liters)
                  </Label>
                  <Input
                    id="calculator-input"
                    type="number"
                    value={usedOilLiters}
                    onChange={(e) => setUsedOilLiters(e.target.value)}
                    placeholder="Enter liters of used oil"
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                {usedOilLiters && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {calculateNewOil(usedOilLiters)}L
                        </div>
                        <div className="text-sm text-muted-foreground">
                          New Oil You'll Receive FREE
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          Loyalty Progress:{" "}
                          {calculateLoyaltyProgress(usedOilLiters)}/1000L
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {1000 - calculateLoyaltyProgress(usedOilLiters)}L more
                          for next reward!
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(calculateLoyaltyProgress(usedOilLiters) / 1000) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exchange Form */}
            <Card className="shadow-xl border-0 bg-white/90">
              <CardHeader>
                <CardTitle>Schedule Your Exchange</CardTitle>
                <CardDescription>
                  Book your free oil exchange pickup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-base font-medium">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Pickup Address
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      className="mt-2 h-12"
                      required
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-base font-medium">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Preferred Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="mt-2 h-12"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="time" className="text-base font-medium">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Preferred Time
                      </Label>
                      <Select
                        value={selectedTime}
                        onValueChange={setSelectedTime}
                        required
                      >
                        <SelectTrigger className="mt-2 h-12">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Used Oil Amount */}
                  <div>
                    <Label
                      htmlFor="oil-amount"
                      className="text-base font-medium"
                    >
                      <Droplets className="h-4 w-4 inline mr-2" />
                      Used Oil Amount (Liters)
                    </Label>
                    <Input
                      id="oil-amount"
                      type="number"
                      value={usedOilLiters}
                      onChange={(e) => setUsedOilLiters(e.target.value)}
                      placeholder="How many liters of used oil do you have?"
                      className="mt-2 h-12"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-base font-medium">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions or details..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-brand-600 hover:bg-brand-700 text-white"
                    disabled={
                      !address ||
                      !selectedDate ||
                      !selectedTime ||
                      !usedOilLiters
                    }
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Schedule Free Exchange
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="py-16 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🎁 Loyalty Rewards Program
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The more you exchange, the more you earn!
            </p>

            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-600 mb-2">
                    1000L
                  </div>
                  <div className="text-xl font-semibold mb-4">
                    = Special Prize!
                  </div>
                  <p className="text-muted-foreground mb-6">
                    For every 1000 liters of used oil you exchange, you receive
                    a special reward gift!
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="font-semibold">Track Progress</div>
                      <div className="text-muted-foreground">
                        Monitor your cumulative exchanges
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="font-semibold">Earn Rewards</div>
                      <div className="text-muted-foreground">
                        Get prizes at milestones
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl p-2 shadow-lg">
                  <img
                    src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                    alt="Maltero Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold">Maltero</span>
                  <p className="text-sm opacity-70">Oil Exchange</p>
                </div>
              </div>
              <p className="text-sm opacity-80">
                Free oil exchange program for a cleaner, sustainable future.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>✓ Free Oil Exchange</li>
                <li>✓ Door-to-Door Pickup</li>
                <li>✓ Loyalty Rewards</li>
                <li>• More services coming soon</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Exchange Rate</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>10L Used Oil → 1L New Oil</li>
                <li>1000L Total → Special Prize</li>
                <li>100% Free Service</li>
                <li>No Hidden Costs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>+356 9919 0222</li>
                <li>malteromalta@gmail.com</li>
                <li>No. 1, Tal-Barrani Industrial Park</li>
                <li>Triq il-Belt Valletta, Ghaxaq, Malta</li>
                <li>Environmental Permit No. 017/16/A</li>
                <li>Mon-Fri: 8AM-6PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-60">
            <p>
              &copy; 2024 Maltero. All rights reserved. | Free Oil Exchange
              Program
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
