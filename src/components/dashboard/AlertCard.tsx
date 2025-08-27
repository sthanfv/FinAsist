"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

type AlertProps = { message: string; type?: 'success' | 'warning' | 'error' };

const alertConfig = {
  success: {
    variant: "default",
    icon: <CheckCircle className="h-4 w-4" />,
    className: "bg-accent/10 border-accent/50 text-accent [&>svg]:text-accent",
    title: "Éxito"
  },
  warning: {
      variant: "default",
      icon: <AlertCircle className="h-4 w-4" />,
      className: "bg-orange-500/10 border-orange-500/50 text-orange-600 [&>svg]:text-orange-600",
      title: "Advertencia"
  },
  error: {
      variant: "destructive",
      icon: <XCircle className="h-4 w-4" />,
      title: "Error"
  }
} as const;


export function AlertCard({ message, type = 'success' }: AlertProps) {
  const config = alertConfig[type];

  return (
    <Alert variant={config.variant} className={`mb-4 ${config.className}`}>
      {config.icon}
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
}
