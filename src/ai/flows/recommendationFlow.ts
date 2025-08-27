'use server';
/**
 * @fileOverview Un agente de IA que proporciona recomendaciones financieras.
 *
 * - getFinancialRecommendation: Una función que genera recomendaciones financieras.
 * - RecommendationInput: El tipo de entrada para la función getFinancialRecommendation.
 * - RecommendationOutput: El tipo de retorno para la función getFinancialRecommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TransactionSchema = z.object({
  category: z.string().describe('La categoría de la transacción (ej: Ocio, Comida, etc.).'),
  amount: z.number().describe('El monto de la transacción.'),
  type: z.enum(['Ingreso', 'Gasto']).describe('El tipo de transacción.'),
});

const RecommendationInputSchema = z.object({
  balance: z.number().describe('El saldo actual del usuario.'),
  transactions: z.array(TransactionSchema).describe('La lista de transacciones del usuario.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
  recommendation: z.string().describe('La recomendación financiera para el usuario.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function getFinancialRecommendation(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: RecommendationInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `Eres un asistente financiero experto. Tu objetivo es dar una recomendación corta y útil (máximo 280 caracteres) al usuario basada en su saldo y sus transacciones recientes. Analiza los gastos y el balance para dar un consejo accionable.

Saldo actual: {{{balance}}}
Transacciones:
{{#each transactions}}
- Categoría: {{{category}}}, Monto: {{{amount}}}, Tipo: {{{type}}}
{{/each}}
`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
