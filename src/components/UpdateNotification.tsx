import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, X } from "lucide-react";

interface UpdateNotificationProps {
  show: boolean;
  message: string;
  onClose?: () => void;
}

export function UpdateNotification({
  show,
  message,
  onClose,
}: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <Alert className="border-green-200 bg-green-50 max-w-sm">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700 pr-8">
          {message}
        </AlertDescription>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="absolute top-2 right-2 text-green-600 hover:text-green-800"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}
