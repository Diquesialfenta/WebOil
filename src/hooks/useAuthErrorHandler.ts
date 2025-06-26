import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthErrorHandler() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle authentication errors
    const handleAuthError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes("Invalid Refresh Token") ||
        event.error?.message?.includes("Refresh Token Not Found") ||
        event.error?.message?.includes("AuthApiError")
      ) {
        console.log("Auth error detected, redirecting to login...");
        navigate("/auth");
      }
    };

    // Listen for uncaught auth errors
    window.addEventListener("error", handleAuthError);

    return () => {
      window.removeEventListener("error", handleAuthError);
    };
  }, [navigate]);

  // Redirect to auth if not loading and no user
  useEffect(() => {
    if (
      !loading &&
      !user &&
      window.location.pathname !== "/auth" &&
      window.location.pathname !== "/"
    ) {
      console.log("No user session, redirecting to auth...");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  return { user, loading };
}
