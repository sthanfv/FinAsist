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
        router.replace('/dashboard');
      }
    }
  }, [isInitialized, user, router]);

  return (
    <main className="flex h-screen items-center justify-center bg-background">
      <p>Cargando aplicación...</p>
    </main>
  );
}
