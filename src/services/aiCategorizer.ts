import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
}

export class AICategorizer {
  private static readonly CATEGORIES = [
    'Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
    'Educación', 'Servicios', 'Compras', 'Hogar', 'Trabajo',
    'Inversiones', 'Ahorro', 'Otros'
  ];

  static async categorizeTransaction(description: string, amount: number): Promise<CategorySuggestion> {
    const prompt = `
    Analiza esta transacción financiera y sugiere la categoría más apropiada:
    
    Descripción: "${description}"
    Monto: $${amount}
    
    Categorías disponibles: ${this.CATEGORIES.join(', ')}
    
    Responde en JSON con este formato exacto:
    {
      "category": "categoria_sugerida",
      "confidence": numero_entre_0_y_1,
      "reasoning": "breve_explicacion_en_español"
    }
    
    Considera el contexto colombiano y patrones de gasto típicos.
    `;
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');
      
      const suggestion = JSON.parse(content) as CategorySuggestion;
      
      // Validar que la categoría esté en la lista
      if (!this.CATEGORIES.includes(suggestion.category)) {
        suggestion.category = 'Otros';
        suggestion.confidence = 0.5;
      }

      return suggestion;
    } catch (error) {
      console.error('AI Categorization error:', error);
      return {
        category: 'Otros',
        confidence: 0.1,
        reasoning: 'Error en categorización automática'
      };
    }
  }

  static async batchCategorize(transactions: Array<{description: string, amount: number}>): Promise<CategorySuggestion[]> {
    const results = await Promise.all(
      transactions.map(t => this.categorizeTransaction(t.description, t.amount))
    );
    return results;
  }
}
