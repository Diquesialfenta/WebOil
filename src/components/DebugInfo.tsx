import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Bug } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DebugInfo() {
  const { user } = useAuth();

  return (
    <Card className="max-w-4xl mx-auto mt-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bug className="h-5 w-5" />
          Debug Information
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Troubleshooting
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-blue-700">
        <Alert className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Status:</strong> Checking database connection and
            user data...
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-semibold">User Information:</h4>
          <div className="bg-gray-800 text-green-400 p-3 rounded text-sm font-mono">
            User ID: {user?.id || "Not available"}
            <br />
            Email: {user?.email || "Not available"}
            <br />
            Name: {user?.user_metadata?.name || "Not available"}
            <br />
            Authenticated: {user ? "Yes" : "No"}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Common Issues & Solutions:</h4>
          <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
            <li>
              <strong>Error code 42P01:</strong> Database tables don't exist -
              run the SQL schema
            </li>
            <li>
              <strong>Error code PGRST116:</strong> No data found - this is
              normal for new users
            </li>
            <li>
              <strong>Error code PGRST301:</strong> Authentication issue - try
              signing out and back in
            </li>
            <li>
              <strong>RLS errors:</strong> Row Level Security blocking access -
              check policies
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <strong>Quick fixes:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Check browser console (F12) for detailed error messages</li>
            <li>Reload the page (F5)</li>
            <li>Sign out and sign back in</li>
            <li>Verify SQL schema was executed in Supabase</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
