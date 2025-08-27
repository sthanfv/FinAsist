
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
  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-success-500' },
    down: { icon: TrendingDown, color: 'text-danger-500' },
    neutral: { icon: Minus, color: 'text-muted-foreground' },
  };

  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <Card className={cn("shadow-soft", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && TrendIcon && trendValue && (
          <div className="flex items-center gap-1 text-xs mt-2">
            <TrendIcon className={cn("h-4 w-4", trendConfig[trend].color)} />
            <span className={cn(trendConfig[trend].color)}>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
