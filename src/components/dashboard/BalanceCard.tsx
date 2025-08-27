"use client";
import { EnhancedCard } from '@/components/ui/EnhancedCard';

type Props = { title: string; amount: number; color?: string };

export default function BalanceCard({ title, amount, color = 'text-primary' }: Props) {
  return (
    <EnhancedCard
      animation="slide"
      padding="lg"
      shadow="lg"
      hoverEffect
    >
      <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
      <p
        className={`mt-2 text-3xl font-bold ${color}`}
      >
        {amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
      </p>
    </EnhancedCard>
  );
}
