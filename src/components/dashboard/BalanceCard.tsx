"use client";
import { motion } from 'framer-motion';

type Props = { title: string; amount: number; color?: string };

export default function BalanceCard({ title, amount, color = 'text-primary' }: Props) {
  return (
    <motion.div
      className="bg-card shadow-lg hover:shadow-primary/20 transition-shadow duration-300 p-6 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
      <p
        className={`mt-2 text-3xl font-bold ${color}`}
      >
        {amount.toLocaleString('es-ES')} pts
      </p>
    </motion.div>
  );
}
