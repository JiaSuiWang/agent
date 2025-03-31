import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onClose: () => void;
  message: string;
}

export function Toast({
  show,
  onClose,
  message,
  className,
  ...props
}: ToastProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-50 rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg transition-all",
        className,
      )}
      {...props}
    >
      {message}
    </div>
  );
}
