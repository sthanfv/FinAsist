
'use server';
/**
 * @fileOverview Un agente de IA que categoriza transacciones.
 *
arroyo'
 */

import {ai} from '@/ai/genkit';
import {
  CategorizationInputSchema,
  CategorizationOutputSchema,
  type CategorizationInput,
  type CategorizationOutput
} from '@/ai/schemas';

const categories = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Servicios',
  'Compras',
  'Ingreso',
  'Otros',
];

export async function categorizeTransaction(input: CategorizationInput): Promise<CategorizationOutput> {
  const categorizationFlow = ai.defineFlow(
    {
      name: 'categorizationFlow',
      inputSchema: CategorizationInputSchema,
      outputSchema: CategorizationOutputSchema,
    },
    async (input) => {
      const { userHistory = [], description } = input;
      // Caché simple para descripciones similares
      const similarTransaction = userHistory.find(
        (h) =>
          h.description &&
          description &&
          h.description
            .toLowerCase()
            .includes(description.toLowerCase().split(' ')[0]) &&
          description
            .toLowerCase()
            .includes(h.description.toLowerCase().split(' ')[0])
      );
  
      if (similarTransaction) {
        return {
          category: similarTransaction.category as any,
          confidence: 0.9,
          reason: `Basado en transacción similar: "${similarTransaction.description}"`,
        };
      }
  
      try {
        const prompt = await ai.definePrompt({
          name: 'categorizationPrompt',
          input: {schema: CategorizationInputSchema},
          output: {schema: CategorizationOutputSchema},
          prompt: `Analiza esta transacción y sugiere la categoría más apropiada:
      
  Descripción: "{{description}}"
  Monto: {{amount}}
  
  Categorías disponibles: ${categories.join(', ')}
  
  {{#if userHistory}}
  Historial del usuario (últimas transacciones):
  {{#each userHistory}}
  - "{{this.description}}" -> {{this.category}}
  {{/each}}
  {{/if}}
  
  Responde SOLO con el nombre exacto de la categoría, nada más. Si la descripción sugiere un ingreso, responde 'Ingreso'.
  Considera el historial del usuario para hacer una mejor sugerencia.
  Basado en la descripción y el historial, proporciona la categoría, un nivel de confianza y una razón corta.`,
        })(input);
  
        if (!prompt.output) {
          throw new Error('No se recibió respuesta del modelo de IA');
        }
        return prompt.output;
      } catch (error) {
        console.error('Error en categorización:', error);
        return {
          category: 'Otros',
          confidence: 0.1,
          reason: 'Error en IA, categorización manual requerida',
        };
      }
    }
  );
  return await categorizationFlow(input);
}
