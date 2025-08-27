"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function HomePage() {
  const { isInitialized, user } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        router.replace('/dashboard');
      } else {
        // Si no hay usuario y ya inicializó, podría redirigir a login o a una landing page
        // Por ahora, lo más seguro es llevarlo al dashboard, que ya maneja la lógica de contenido para invitados
        router.replace('/dashboard');
      }
    }
  }, [isInitialized, user, router]);

  // El estado de carga principal ahora se maneja en RootLayout,
  // pero mantenemos un loader aquí como fallback.
  return (
    <main className="flex h-screen items-center justify-center bg-background">
      <p>Cargando aplicación...</p>
    </main>
  );
}
