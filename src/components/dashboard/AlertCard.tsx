
"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type AlertCardProps = { 
  title: string;
  message: string; 
  type?: 'success' | 'warning' | 'error' | 'info';
};

const alertConfig = {
  success: {
    variant: "default" as const,
    icon: <CheckCircle className="h-4 w-4" />,
    className: "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600",
  },
  warning: {
      variant: "default" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600",
  },
  error: {
      variant: "destructive" as const,
      icon: <XCircle className="h-4 w-4" />,
      className: "",
  },
  info: {
    variant: "default" as const,
    icon: <Info className="h-4 w-4" />,
    className: "bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600",
  }
};


export function AlertCard({ title, message, type = 'info' }: AlertCardProps) {
  const config = alertConfig[type];

  return (
    <Alert variant={config.variant} className={`mb-4 ${config.className}`}>
      {config.icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
}
