"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register } = useAppContext();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
        toast({ title: 'Error', description: 'Por favor, completa todos los campos.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    try {
      await register(email, password);
      toast({ title: 'Éxito', description: 'Tu cuenta ha sido creada.' });
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Error de registro', description: err.message, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
       <Card className="w-full max-w-md shadow-soft">
        <CardHeader>
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
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleRegister} className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
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
