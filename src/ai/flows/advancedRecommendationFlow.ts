
'use server';
/**
 * @fileOverview Un agente de IA que proporciona recomendaciones financieras avanzadas.
 *
 * - getAdvancedRecommendation: Una función que genera recomendaciones financieras avanzadas.
 */

import { ai } from '@/ai/genkit';
import { 
  AdvancedRecommendationInputSchema, 
  AdvancedRecommendationOutputSchema,
  type AdvancedRecommendationInput,
  type AdvancedRecommendationOutput 
} from '@/ai/schemas';

export async function getAdvancedRecommendation(input: AdvancedRecommendationInput): Promise<AdvancedRecommendationOutput> {
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
  return await advancedRecommendationFlow(input);
}
