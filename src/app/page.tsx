"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AppContext';

export default function HomePage() {
  const { loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace('/dashboard');
    }
  }, [loading, router]);

  return (
    <main className="flex h-screen items-center justify-center bg-background">
      <p>Cargando aplicación...</p>
    </main>
  );
}
