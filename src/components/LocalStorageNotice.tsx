import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function LocalStorageNotice() {
  return (
    <Alert className="max-w-4xl mx-auto mt-4 border-orange-200 bg-orange-50">
      <InfoIcon className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        <strong>Modo Temporal:</strong> Las órdenes se están guardando
        localmente mientras configuramos la base de datos. Tus datos estarán
        disponibles en este navegador. Una vez configurada la base de datos de
        Supabase, migraremos todos los datos automáticamente.
      </AlertDescription>
    </Alert>
  );
}
