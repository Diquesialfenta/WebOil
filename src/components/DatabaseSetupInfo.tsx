import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Database, ExternalLink } from "lucide-react";

interface DatabaseSetupInfoProps {
  show: boolean;
}

export function DatabaseSetupInfo({ show }: DatabaseSetupInfoProps) {
  if (!show) return null;

  return (
    <Card className="max-w-4xl mx-auto mt-8 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Configuración de Base de Datos Requerida
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Setup Needed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-blue-700">
        <Alert className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Para mostrar <strong>datos reales</strong> en el dashboard,
            necesitas crear las tablas en tu base de datos de Supabase.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold">
            Pasos para configurar la base de datos:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Ve a tu{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                proyecto en Supabase <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Ve a <strong>SQL Editor</strong> en el panel lateral
            </li>
            <li>
              Copia todo el contenido del archivo{" "}
              <code className="bg-blue-100 px-1 rounded">
                database_schema.sql
              </code>
            </li>
            <li>Pégalo en el editor y ejecuta el script</li>
            <li>Recarga esta página</li>
          </ol>
        </div>

        <div className="bg-gray-800 text-green-400 p-4 rounded text-xs font-mono max-h-40 overflow-y-auto">
          <div className="text-yellow-400 mb-2">
            -- Contenido del archivo database_schema.sql:
          </div>
          <div className="space-y-1">
            <div>CREATE TABLE profiles (...);</div>
            <div>CREATE TABLE oil_orders (...);</div>
            <div>CREATE TABLE loyalty_rewards (...);</div>
            <div>-- Políticas de seguridad RLS</div>
            <div>-- Triggers automáticos</div>
            <div>-- Vista user_stats</div>
          </div>
        </div>

        <div className="text-sm">
          <strong>¿Qué incluye el schema?</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              <strong>Tablas</strong>: profiles, oil_orders, loyalty_rewards
            </li>
            <li>
              <strong>Seguridad</strong>: Row Level Security (RLS) configurado
            </li>
            <li>
              <strong>Automatización</strong>: Triggers para timestamps y
              perfiles
            </li>
            <li>
              <strong>Vista</strong>: user_stats para estadísticas agregadas
            </li>
          </ul>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <InfoIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Mientras tanto:</strong> El dashboard funciona con datos por
            defecto. Una vez que configures la base de datos, mostrará
            estadísticas reales de intercambios de aceite.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
