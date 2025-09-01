
export class SmartCategorization {
  private static patterns: Record<string, string[]> = {
    'Alimentación': ['mercado', 'restaurante', 'comida', 'supermercado', 'rappi', 'didi food', 'almuerzo', 'cena', 'domicilio'],
    'Transporte': ['uber', 'didi', 'gasolina', 'transmilenio', 'taxi', 'peaje', 'bus', 'transporte'],
    'Vivienda': ['arriendo', 'hipoteca', 'servicios publicos', 'agua', 'luz', 'gas', 'internet', 'administracion'],
    'Salud': ['farmacia', 'eps', 'medico', 'drogueria', 'terapia', 'medicamentos'],
    'Entretenimiento': ['cine', 'netflix', 'spotify', 'concierto', 'videojuegos', 'hbo', 'disney+'],
    'Ropa y Accesorios': ['ropa', 'zapatos', 'accesorios', 'centro comercial'],
    'Educación': ['universidad', 'colegio', 'curso', 'libros', 'platzi', 'udemy'],
    'Deudas': ['tarjeta de credito', 'prestamo', 'credito'],
    'Cuidado Personal': ['gimnasio', 'gym', 'peluqueria', 'barberia', 'spa'],
    'Regalos y Donaciones': ['regalo', 'donacion', 'cumpleaños'],
    'Ingresos': ['salario', 'nomina', 'pago', 'honorarios', 'freelance', 'rendimientos'],
  };

  /**
   * Sugiere una categoría para una transacción basada en palabras clave en su descripción.
   * @param description La descripción de la transacción.
   * @returns Una categoría sugerida o 'Otros' si no se encuentra ninguna coincidencia.
   */
  static suggestCategory(description: string): string {
    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(this.patterns)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    return 'Otros';
  }
}
