
'use client';
import { ReactNode, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  none: '',
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

export const EnhancedCard = ({
  children,
  variant = 'default',
  hoverEffect = false,
  padding = 'lg',
  shadow = 'md',
  animation = 'none',
  className,
  ...props
}: EnhancedCardProps) => {
  const motionProps = animations[animation];

  return (
    <motion.div
      className={cn(
        'rounded-xl transition-all duration-300',
        cardVariants[variant],
        paddingVariants[padding],
        shadowVariants[shadow],
        hoverEffect && 'card-hover',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};
