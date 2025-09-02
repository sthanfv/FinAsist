"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, configureGoogleProvider } from '@/lib/firebase';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Chrome,
  KeyRound,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
// Schemas de validación ultra-seguros
const loginSchema = z.object({
  email: z.string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
const registerSchema = z.object({
  email: z.string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim(),
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres para mayor seguridad')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
const resetSchema = z.object({
  email: z.string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim(),
});
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ResetForm = z.infer<typeof resetSchema>;
interface AuthPanelProps {
  initialMode?: 'login' | 'register' | 'reset';
}
export const AuthPanel = ({ initialMode = 'login' }: AuthPanelProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();
  const { isLoading, setLoading } = useAppStore();
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', firstName: '' }
  });
  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' }
  });
  // Función para verificar fortaleza de contraseña
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };
  const currentPassword = registerForm.watch('password') || '';
  const passwordStrength = getPasswordStrength(currentPassword);
  const getStrengthColor = (strength: number) => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  const getStrengthText = (strength: number) => {
    if (strength < 50) return 'Débil';
    if (strength < 75) return 'Media';
    return 'Fuerte';
  };
  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // SOLUCIÓN: Refrescar el token para obtener el estado más reciente
      await userCredential.user.reload();
      
      // Verificar si el email está verificado DESPUÉS del reload
      if (!userCredential.user.emailVerified) {
        toast.warning('Tu cuenta no está verificada. Te hemos enviado un nuevo email de verificación.');
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        setLoading(false); // Detener el loading para permitir la interacción
        return;
      }
      toast.success('¡Bienvenido de vuelta!');
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
          break;
        default:
          errorMessage = 'Error de conexión. Verifica tu internet';
      }
      
      toast.error(errorMessage);
    } finally {
      if(router.asPath !== '/dashboard') { // No detener el loading si ya estamos navegando
        setLoading(false);
      }
    }
  };
  const handleRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Actualizar perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: data.firstName
      });
      // Enviar email de verificación
      await sendEmailVerification(userCredential.user);
      
      toast.success('¡Cuenta creada! Revisa tu correo para verificar tu cuenta.');
      setVerificationSent(true);
      setMode('login');
    } catch (error: any) {
      let errorMessage = 'Error al crear cuenta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este correo electrónico';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registro deshabilitado temporalmente';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
        default:
          errorMessage = 'Error de conexión. Verifica tu internet';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordReset = async (data: ResetForm) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast.success('¡Email de recuperación enviado! Revisa tu bandeja de entrada.');
      setEmailSent(true);
    } catch (error: any) {
      let errorMessage = 'Error al enviar email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        default:
          errorMessage = 'Error de conexión. Intenta más tarde';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = configureGoogleProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success(`¡Bienvenido ${result.user.displayName}!`);
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Error con autenticación de Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Autenticación cancelada';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup bloqueado. Permite popups para este sitio';
          break;
        default:
          errorMessage = 'Error de conexión con Google';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const features = [
    { icon: TrendingUp, text: 'Análisis financiero inteligente' },
    { icon: Sparkles, text: 'Asistente IA personalizado' },
    { icon: Shield, text: 'Seguridad bancaria' },
    { icon: Zap, text: 'Sincronización en tiempo real' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-white/20 hover:bg-white/90 dark:hover:bg-slate-700/90 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </motion.div>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FinAssist
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Tu asistente financiero inteligente</p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Toma control de tus finanzas con IA
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                Gestiona tus transacciones, alcanza tus metas de ahorro y recibe 
                recomendaciones personalizadas con la potencia de la inteligencia artificial.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <feature.icon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
              </div>
              
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {mode === 'login' && 'Iniciar sesión'}
                  {mode === 'register' && 'Crear cuenta'}
                  {mode === 'reset' && 'Recuperar contraseña'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {mode === 'login' && 'Bienvenido de vuelta a FinAssist'}
                  {mode === 'register' && 'Comienza tu viaje financiero hoy'}
                  {mode === 'reset' && 'Te enviaremos un enlace de recuperación'}
                </p>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Messages */}
              <AnimatePresence>
                {verificationSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                        Email de verificación enviado. Revisa tu bandeja de entrada.
                      </p>
                    </div>
                    
                    {/* NUEVO: Botón para verificar después de hacer clic en el email */}
                    <Button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          // Refrescar el usuario actual
                          if (auth.currentUser) {
                            await auth.currentUser.reload();
                            
                            if (auth.currentUser.emailVerified) {
                              toast.success('¡Email verificado! Redirigiendo...');
                              router.push('/dashboard');
                            } else {
                              toast.warning('Aún no hemos detectado la verificación. Asegúrate de hacer clic en el enlace del email.');
                            }
                          }
                        } catch (error) {
                          toast.error('Error al verificar el estado del email');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full mr-2"
                        />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Ya verifiqué mi email
                    </Button>
                  </motion.div>
                )}
                {emailSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        Email de recuperación enviado exitosamente.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {mode !== 'reset' && (
                <>
                  {/* Google Auth Button */}
                  <Button
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
                  >
                    <Chrome className="h-5 w-5 mr-3 text-red-500" />
                    Continuar con Google
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-slate-800 text-slate-500">
                        o continúa con email
                      </span>
                    </div>
                  </div>
                </>
              )}
              {/* Forms */}
              <AnimatePresence mode="wait">
                {mode === 'login' && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...loginForm.register('email')}
                          id="login-email"
                          type="email"
                          placeholder="tu@correo.com"
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...loginForm.register('password')}
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="********"
                          disabled={isLoading}
                          className="pl-10 pr-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        'Iniciar sesión'
                      )}
                    </Button>
                  </motion.form>
                )}
                {mode === 'register' && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...registerForm.register('firstName')}
                          id="register-name"
                          type="text"
                          placeholder="Tu nombre"
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      {registerForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...registerForm.register('email')}
                          id="register-email"
                          type="email"
                          placeholder="tu@correo.com"
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...registerForm.register('password')}
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres"
                          disabled={isLoading}
                          className="pl-10 pr-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {currentPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${passwordStrength}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength < 50 ? 'text-red-600' :
                              passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {getStrengthText(passwordStrength)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirmar contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...registerForm.register('confirmPassword')}
                          id="register-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repite tu contraseña"
                          disabled={isLoading}
                          className="pl-10 pr-12 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || passwordStrength < 75}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        'Crear cuenta'
                      )}
                    </Button>
                  </motion.form>
                )}
                {mode === 'reset' && (
                  <motion.form
                    key="reset"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={resetForm.handleSubmit(handlePasswordReset)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...resetForm.register('email')}
                          id="reset-email"
                          type="email"
                          placeholder="tu@correo.com"
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      {resetForm.formState.errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {resetForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Enviar enlace de recuperación
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
              {/* Mode Toggle */}
              <div className="text-center space-y-2">
                {mode !== 'reset' ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                    <button
                      onClick={() => {
                        setMode(mode === 'login' ? 'register' : 'login');
                        loginForm.reset();
                        registerForm.reset();
                        setVerificationSent(false);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ¿Recordaste tu contraseña?{' '}
                    <button
                      onClick={() => {
                        setMode('login');
                        resetForm.reset();
                        setEmailSent(false);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      Volver al login
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

    