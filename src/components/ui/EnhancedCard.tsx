
'use client';
import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';

interface EnhancedCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  hoverEffect?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  animation?: 'none' | 'fade' | 'slide' | 'scale';
}

const cardVariants = {
  default: 'bg-card text-card-foreground border border-border',
  glass: 'glass-effect text-foreground',
  gradient: 'gradient-bg text-white border-0',
  bordered: 'bg-card text-card-foreground border-2 border-primary/20',
};

const paddingVariants = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const shadowVariants = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const animations = {
  none: {},
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slide: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export function EnhancedCard({
  children,
  variant = 'default',
  hoverEffect = false,
  padding = 'lg',
  shadow = 'md',
  animation = 'none',
  className,
  ...props
}: EnhancedCardProps) {
  const motionProps = animations[animation];

  const cardClasses = cn(
    'rounded-xl transition-all duration-300',
    cardVariants[variant],
    paddingVariants[padding],
    shadowVariants[shadow],
    hoverEffect && 'card-hover',
    className
  );
  
  if (animation === 'none') {
    return (
      <div className={cardClasses} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Componentes específicos
export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  className 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}) {
  const trendColors = {
    up: 'text-success-600',
    down: 'text-danger-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <EnhancedCard className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className={cn('mt-2 flex items-center text-sm', trendColors[trend])}>
          <span>{trendValue}</span>
        </div>
      )}
    </EnhancedCard>
  );
}
