import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, ExternalLink } from "lucide-react";
import { isDemoMode } from "@/lib/supabase";

export function SupabaseSetupInfo() {
  if (!isDemoMode) return null;

  return (
    <Card className="max-w-2xl mx-auto mt-8 border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <InfoIcon className="h-5 w-5" />
          Modo Demo - Configuración de Supabase
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Demo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-amber-700">
        <Alert className="border-amber-200 bg-amber-50">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            La aplicación está ejecutándose en <strong>modo demo</strong>. Los
            datos de autenticación son simulados y no se guardan realmente.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-semibold">Para configurar Supabase real:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Ve a{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                supabase.com <ExternalLink className="h-3 w-3" />
              </a>{" "}
              y crea un proyecto
            </li>
            <li>Ve a Settings → API en tu proyecto</li>
            <li>Copia tu Project URL y anon/public key</li>
            <li>
              Crea un archivo{" "}
              <code className="bg-amber-100 px-1 rounded">.env.local</code> con:
            </li>
          </ol>
          <div className="bg-gray-800 text-green-400 p-3 rounded text-sm font-mono">
            VITE_SUPABASE_URL=tu_url_del_proyecto
            <br />
            VITE_SUPABASE_ANON_KEY=tu_clave_anonima
          </div>
        </div>

        <div className="text-sm">
          <strong>En modo demo puedes:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              Registrarte con cualquier email y contraseña (+6 caracteres)
            </li>
            <li>Iniciar sesión con cualquier email y contraseña</li>
            <li>Ver el dashboard del usuario</li>
            <li>Cerrar sesión</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
