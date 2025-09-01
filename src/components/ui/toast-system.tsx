'use client';
import { toast } from 'sonner';

export const NotificationSystem = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
      position: 'top-right',
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
      position: 'top-right',
    });
  },
  financial: (message: string, amount: number) => {
    toast.success(message, {
      description: `Monto: ${new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount)}`,
      duration: 5000,
      position: 'top-right',
    });
  }
};
