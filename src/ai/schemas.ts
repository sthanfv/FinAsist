/**
 * @fileOverview Schemas and types for AI flows.
 * This file contains all Zod schemas and TypeScript type definitions
 * used across the different Genkit flows in the application.
 * By centralizing them here, we avoid "use server" conflicts in Next.js.
 */
import { z } from 'zod';

// Base schemas used in multiple flows
export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  category: z.string().describe('La categoría de la transacción (ej: Ocio, Comida, etc.).'),
  amount: z.number().describe('El monto de la transacción.'),
  type: z.enum(['income', 'expense']).describe('El tipo de transacción.'),
  description: z.string().optional(),
});

export const GoalSchema = z.object({
  id: z.string(),
  name: z.string().describe('El título de la meta de ahorro.'),
  targetAmount: z.number().describe('La cantidad objetivo a ahorrar.'),
  currentAmount: z.number().describe('La cantidad que ya se ha ahorrado.'),
  deadline: z.string().describe('La fecha límite para alcanzar la meta.'),
});

// Schemas for categorizationFlow
const TransactionHistorySchema = z.object({
  description: z.string(),
  category: z.string(),
});

export const CategorizationInputSchema = z.object({
  description: z.string().describe('La descripción de la transacción a categorizar.'),
  amount: z.number().describe('El monto de la transacción.'),
  userHistory: z
    .array(TransactionHistorySchema)
    .optional()
    .describe('Una lista de transacciones pasadas del usuario para dar contexto.'),
});
export type CategorizationInput = z.infer<typeof CategorizationInputSchema>;

const categories = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Servicios',
  'Compras',
  'Hogar',
  'Cuidado Personal',
  'Mascotas',
  'Suscripciones',
  'Deudas',
  'Inversiones',
  'Regalos',
  'Ingreso',
  'Otros',
];

export const CategorizationOutputSchema = z.object({
  category: z.enum(categories as [string, ...string[]]).describe('La categoría sugerida para la transacción.'),
  confidence: z
    .number()
    .describe(
      'Un valor entre 0 y 1 que indica la confianza de la sugerencia.'
    ),
  reason: z
    .string()
    .describe('Una breve explicación de por qué se sugirió esa categoría.'),
});
export type CategorizationOutput = z.infer<typeof CategorizationOutputSchema>;

// Schemas for advancedRecommendationFlow
export const AdvancedRecommendationInputSchema = z.object({
  balance: z.number().describe('El saldo actual del usuario.'),
  transactions: z.array(TransactionSchema).describe('La lista de transacciones del usuario.'),
  goals: z.array(GoalSchema).describe('Las metas de ahorro del usuario.'),
});
export type AdvancedRecommendationInput = z.infer<typeof AdvancedRecommendationInputSchema>;

export const AdvancedRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('La lista de recomendaciones financieras para el usuario.'),
});
export type AdvancedRecommendationOutput = z.infer<typeof AdvancedRecommendationOutputSchema>;


// Schemas for recommendationFlow
const SimpleTransactionSchema = z.object({
    category: z.string().describe('La categoría de la transacción (ej: Ocio, Comida, etc.).'),
    amount: z.number().describe('El monto de la transacción.'),
    type: z.enum(['Ingreso', 'Gasto']).describe('El tipo de transacción.'),
});
  
export const RecommendationInputSchema = z.object({
    balance: z.number().describe('El saldo actual del usuario.'),
    transactions: z.array(SimpleTransactionSchema).describe('La lista de transacciones del usuario.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

export const RecommendationOutputSchema = z.object({
    recommendation: z.string().describe('La recomendación financiera para el usuario.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;
