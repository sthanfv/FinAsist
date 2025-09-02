
'use server';
/**
 * @fileOverview Un agente de IA que proporciona recomendaciones financieras avanzadas.
 *
 * - getAdvancedRecommendation: Una función que genera recomendaciones financieras avanzadas.
 * - AdvancedRecommendationInput: El tipo de entrada para la función getAdvancedRecommendation.
 * - AdvancedRecommendationOutput: El tipo de retorno para la función getAdvancedRecommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  category: z.string().describe('La categoría de la transacción (ej: Ocio, Comida, etc.).'),
  amount: z.number().describe('El monto de la transacción.'),
  type: z.enum(['income', 'expense']).describe('El tipo de transacción.'),
  description: z.string().optional(),
});

const GoalSchema = z.object({
    id: z.string(),
    name: z.string().describe('El título de la meta de ahorro.'),
    targetAmount: z.number().describe('La cantidad objetivo a ahorrar.'),
    currentAmount: z.number().describe('La cantidad que ya se ha ahorrado.'),
    deadline: z.string().describe('La fecha límite para alcanzar la meta.'),
});

const AdvancedRecommendationInputSchema = z.object({
  balance: z.number().describe('El saldo actual del usuario.'),
  transactions: z.array(TransactionSchema).describe('La lista de transacciones del usuario.'),
  goals: z.array(GoalSchema).describe('Las metas de ahorro del usuario.'),
});
export type AdvancedRecommendationInput = z.infer<typeof AdvancedRecommendationInputSchema>;

const AdvancedRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('La lista de recomendaciones financieras para el usuario.'),
});
export type AdvancedRecommendationOutput = z.infer<typeof AdvancedRecommendationOutputSchema>;

const advancedRecommendationFlow = ai.defineFlow(
  {
    name: 'advancedRecommendationFlow',
    inputSchema: AdvancedRecommendationInputSchema,
    outputSchema: AdvancedRecommendationOutputSchema,
  },
  async (input) => {
    const prompt = await ai.definePrompt({
      name: 'advancedRecommendationPrompt',
      input: { schema: AdvancedRecommendationInputSchema },
      output: { schema: AdvancedRecommendationOutputSchema },
      prompt: `Eres un asistente financiero experto. Tu objetivo es dar una lista de recomendaciones cortas y útiles al usuario basadas en su saldo, sus transacciones recientes y sus metas de ahorro.
Analiza los gastos, el balance y el progreso de las metas para dar consejos accionables y personalizados. Si todo está en orden, da un mensaje de ánimo.

Saldo actual: {{{balance}}}

Transacciones:
{{#each transactions}}
- Categoría: {{{category}}}, Monto: {{{amount}}}, Tipo: {{{type}}}
{{/each}}

Metas de Ahorro:
{{#each goals}}
- Meta: "{{{name}}}", Objetivo: {{{targetAmount}}}, Ahorrado: {{{currentAmount}}}, Fecha Límite: {{{deadline}}}
{{/each}}

Genera una lista de 2 a 4 recomendaciones clave.
`,
    })(input);

    if (!prompt.output) {
      throw new Error('No se recibió respuesta del modelo de IA');
    }
    return prompt.output;
  }
);


export async function getAdvancedRecommendation(input: AdvancedRecommendationInput): Promise<AdvancedRecommendationOutput> {
  const result = await advancedRecommendationFlow(input);
  return result;
}
