import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/auth";
import { clearCorruptedAuthData } from "@/lib/authUtils";

export function SessionRecovery() {
  const { user } = useAuth();

  const handleClearSession = async () => {
    try {
      // Clear all auth data
      await authService.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      // Continue with cleanup even if signOut fails
    }

    // Clear corrupted auth data from storage
    clearCorruptedAuthData();

    // Force reload to reset everything
    window.location.href = "/auth";
  };

  // Only show if there are auth issues
  if (user) return null;

  return (
    <Card className="max-w-md mx-auto mt-8 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Session Issue Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-orange-700">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your authentication session has expired or become corrupted. This
            can happen if you've been inactive for a while.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-semibold">Quick Fix:</h4>
          <Button
            onClick={handleClearSession}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Session & Sign In Again
          </Button>
        </div>

        <div className="text-sm">
          <p>
            <strong>What this does:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Clears all stored authentication data</li>
            <li>Redirects you to the sign-in page</li>
            <li>Resets your session completely</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
