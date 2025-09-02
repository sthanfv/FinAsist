'use server';
/**
 * @fileOverview Un agente de IA que proporciona recomendaciones financieras.
 *
 * - getFinancialRecommendation: Una función que genera recomendaciones financieras.
 */

import { ai } from '@/ai/genkit';
import {
    RecommendationInputSchema,
    RecommendationOutputSchema,
    type RecommendationInput,
    type RecommendationOutput
} from '@/ai/schemas';


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
    if (!output) {
      throw new Error('No se recibió respuesta del modelo de IA');
    }
    return output;
  }
);
