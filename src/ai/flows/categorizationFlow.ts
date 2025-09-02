
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

export async function categorizeTransaction(input: CategorizationInput): Promise<CategorizationOutput> {
  const categorizationFlow = ai.defineFlow(
    {
      name: 'categorizationFlow',
      inputSchema: CategorizationInputSchema,
      outputSchema: CategorizationOutputSchema,
    },
    async (input) => {
      
        const prompt = await ai.definePrompt({
          name: 'categorizationPrompt',
          input: {schema: CategorizationInputSchema},
          output: {schema: CategorizationOutputSchema},
          prompt: `Analiza esta transacción y sugiere la categoría más apropiada:
      
  Descripción: "{{description}}"
  Monto: {{amount}}
  
  Categorías disponibles: ${categories.join(', ')}
  
  {{#if userHistory}}
  Historial del usuario (últimas transacciones para dar contexto):
  {{#each userHistory}}
  - "{{this.description}}" fue categorizado como {{this.category}}
  {{/each}}
  {{/if}}
  
  Basado en la descripción y el historial, proporciona la categoría, un nivel de confianza (confidence) de 0 a 1, y una razón (reason) corta para tu elección.
  Si la descripción sugiere un ingreso (salario, pago, etc.), la categoría debe ser 'Ingreso'.`,
        })(input);
  
        if (!prompt.output) {
          throw new Error('No se recibió respuesta del modelo de IA');
        }
        
        // Asegurarnos que la categoría está en la lista permitida
        if(!categories.includes(prompt.output.category)) {
            prompt.output.category = 'Otros';
            prompt.output.confidence = Math.min(prompt.output.confidence, 0.5);
            prompt.output.reason = `Categoría no reconocida, asignada a Otros. Razón original: ${prompt.output.reason}`;
        }
        
        return prompt.output;
    }
  );
  return await categorizationFlow(input);
}
