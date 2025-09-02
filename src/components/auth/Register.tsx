"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NotificationSystem } from '@/components/ui/toast-system';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { isLoading, setLoading } = useAppStore();


  const handleRegister = async () => {
    if (!email || !password) {
        NotificationSystem.error('Error', 'Por favor, completa todos los campos.');
        return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      NotificationSystem.success('Éxito', 'Tu cuenta ha sido creada.');
      router.push('/dashboard');
    } catch (err: any) {
      NotificationSystem.error('Error de registro', err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
       <Card className="w-full max-w-md shadow-soft relative">
        <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center pt-12">
          <CardTitle className="text-2xl font-headline">Crear una cuenta</CardTitle>
          <CardDescription>Empieza a gestionar tus finanzas hoy mismo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleRegister} className="w-full" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
           <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
