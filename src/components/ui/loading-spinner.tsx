import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

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

export const TransactionSkeleton = () => (
  <div className="space-y-3">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="flex items-center space-x-4 p-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-1/4" />
      </div>
    ))}
  </div>
);
