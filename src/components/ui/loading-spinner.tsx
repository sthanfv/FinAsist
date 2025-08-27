import { cn } from '@/lib/utils';
interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
export default function LoadingSpinner({ 
  className, 
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size],
          className
        )}
      />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Cargando FinAssist...
      </p>
    </div>
  );
}