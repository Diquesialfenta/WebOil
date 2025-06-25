import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Droplets,
  Shield,
  UserPlus,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [registerMessage, setRegisterMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [loginMessage, setLoginMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration form handlers
  const handleRegisterChange = (field: string, value: string) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    setRegisterMessage(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage(null);

    try {
      // Basic validation
      if (!registerForm.name || !registerForm.email || !registerForm.password) {
        throw new Error("All fields are required");
      }

      if (registerForm.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Simulate API call (replace with Firebase Auth)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setRegisterMessage({
        type: "success",
        text: "Account created successfully! Welcome to Maltero Oil Exchange Program.",
      });

      // Reset form
      setRegisterForm({ name: "", email: "", password: "" });
    } catch (error: any) {
      setRegisterMessage({
        type: "error",
        text: error.message || "Failed to create account. Please try again.",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Login form handlers
  const handleLoginChange = (field: string, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    setLoginMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);

    try {
      // Basic validation
      if (!loginForm.email || !loginForm.password) {
        throw new Error("Email and password are required");
      }

      // Simulate API call (replace with Firebase Auth)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setLoginMessage({
        type: "success",
        text: "Login successful! Redirecting to your dashboard...",
      });

      // Reset form
      setLoginForm({ email: "", password: "" });
    } catch (error: any) {
      setLoginMessage({
        type: "error",
        text: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-50/30 to-trust-50/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="transition-transform hover:scale-105">
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
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl p-8 mb-8 inline-block shadow-2xl relative overflow-hidden">
              {/* Background Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <img
                  src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                  alt="Maltero Background"
                  className="w-32 h-32 object-contain"
                />
              </div>
              {/* Main Logo */}
              <div className="relative z-10">
                <div className="bg-white/20 rounded-full p-4 ring-4 ring-white/30 mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                  <img
                    src="https://cdn.builder.io/api/v1/assets/966f3cfa0fff4eb68fda2d512d8d0925/maltero-logo-white-background-a132fd?format=webp&width=800"
                    alt="Maltero Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Join Maltero
                </h1>
                <p className="text-white/90">
                  Start exchanging used oil for new oil - FREE
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-brand-600" />
                <span className="text-sm">Secure Authentication</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Droplets className="h-5 w-5 text-brand-600" />
                <span className="text-sm">10L Used = 1L New</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-brand-600" />
                <span className="text-sm">100% Free Service</span>
              </div>
            </div>
          </div>

          {/* Authentication Forms */}
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="text-base">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="text-base">
                  Create Account
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-trust-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-trust-600" />
                    </div>
                    <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                    <CardDescription>
                      Sign in to manage your oil exchanges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      id="login-form"
                      onSubmit={handleLoginSubmit}
                      className="space-y-6"
                    >
                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="login-email"
                          className="text-base font-medium"
                        >
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email Address
                        </Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) =>
                            handleLoginChange("email", e.target.value)
                          }
                          placeholder="Enter your email"
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="login-password"
                          className="text-base font-medium"
                        >
                          <Lock className="h-4 w-4 inline mr-2" />
                          Password
                        </Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) =>
                            handleLoginChange("password", e.target.value)
                          }
                          placeholder="Enter your password"
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full h-14 text-lg bg-trust-600 hover:bg-trust-700 text-white"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Signing In...
                          </div>
                        ) : (
                          <>
                            <User className="h-5 w-5 mr-2" />
                            Iniciar sesión
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Login Message */}
                    {loginMessage && (
                      <Alert
                        className={`mt-4 ${loginMessage.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
                      >
                        {loginMessage.type === "error" ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <AlertDescription
                          className={
                            loginMessage.type === "error"
                              ? "text-red-700"
                              : "text-green-700"
                          }
                        >
                          {loginMessage.text}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Registration Form */}
              <TabsContent value="register">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="h-8 w-8 text-brand-600" />
                    </div>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>
                      Join the free oil exchange program
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      id="register-form"
                      onSubmit={handleRegisterSubmit}
                      className="space-y-6"
                    >
                      {/* Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-name"
                          className="text-base font-medium"
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          Full Name
                        </Label>
                        <Input
                          id="register-name"
                          type="text"
                          value={registerForm.name}
                          onChange={(e) =>
                            handleRegisterChange("name", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-email"
                          className="text-base font-medium"
                        >
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email Address
                        </Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) =>
                            handleRegisterChange("email", e.target.value)
                          }
                          placeholder="Enter your email"
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="register-password"
                          className="text-base font-medium"
                        >
                          <Lock className="h-4 w-4 inline mr-2" />
                          Password
                        </Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) =>
                            handleRegisterChange("password", e.target.value)
                          }
                          placeholder="Minimum 6 characters"
                          className="h-12"
                          required
                          minLength={6}
                        />
                        <p className="text-sm text-muted-foreground">
                          Password must be at least 6 characters long
                        </p>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full h-14 text-lg bg-brand-600 hover:bg-brand-700 text-white"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating Account...
                          </div>
                        ) : (
                          <>
                            <UserPlus className="h-5 w-5 mr-2" />
                            Crear cuenta
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Registration Message */}
                    {registerMessage && (
                      <Alert
                        className={`mt-4 ${registerMessage.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
                      >
                        {registerMessage.type === "error" ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <AlertDescription
                          className={
                            registerMessage.type === "error"
                              ? "text-red-700"
                              : "text-green-700"
                          }
                        >
                          {registerMessage.text}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Benefits Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-6 bg-white/80 rounded-2xl shadow-lg">
              <div className="bg-brand-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-semibold mb-2">Free Oil Exchange</h3>
              <p className="text-sm text-muted-foreground">
                Exchange 10L used oil for 1L new oil at no cost
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 rounded-2xl shadow-lg">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Loyalty Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get special prizes every 1000L exchanged
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
