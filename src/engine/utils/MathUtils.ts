import { ComputationCache } from '../cache/ComputationCache';
export class MathUtils {
  
  // Regresión lineal optimizada con memoización
  static linearRegression = ComputationCache.memoize(
    (dataPoints: number[]): { slope: number; intercept: number; r2: number } => {
      if (dataPoints.length < 2) {
        return { slope: 0, intercept: 0, r2: 0 };
      }
      const n = dataPoints.length;
      const x = Array.from({ length: n }, (_, i) => i);
      
      // Calcular medias
      const xMean = x.reduce((sum, val) => sum + val, 0) / n;
      const yMean = dataPoints.reduce((sum, val) => sum + val, 0) / n;
      
      // Calcular pendiente y intercepto
      let numerator = 0;
      let denominator = 0;
      let totalVariation = 0;
      let explainedVariation = 0;
      
      for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = dataPoints[i] - yMean;
        numerator += xDiff * yDiff;
        denominator += xDiff * xDiff;
        totalVariation += yDiff * yDiff;
      }
      
      const slope = denominator !== 0 ? numerator / denominator : 0;
      const intercept = yMean - slope * xMean;
      
      // Calcular R²
      for (let i = 0; i < n; i++) {
        const predicted = slope * x[i] + intercept;
        const residual = dataPoints[i] - predicted;
        explainedVariation += residual * residual;
      }
      
      const r2 = totalVariation !== 0 ? 1 - (explainedVariation / totalVariation) : 0;
      
      return { slope, intercept, r2: Math.max(0, r2) };
    },
    { ttl: 600000 } // 10 minutos
  );
  // Desviación estándar con cache
  static standardDeviation = ComputationCache.memoize(
    (values: number[]): number => {
      if (values.length < 2) return 0;
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
      const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
      
      return Math.sqrt(avgSquaredDiff);
    },
    { ttl: 300000 }
  );
  // Percentiles optimizados
  static percentile = ComputationCache.memoize(
    (values: number[], percentile: number): number => {
      if (values.length === 0) return 0;
      
      const sorted = [...values].sort((a, b) => a - b);
      const index = (percentile / 100) * (sorted.length - 1);
      
      if (Number.isInteger(index)) {
        return sorted[index];
      }
      
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    },
    { ttl: 300000 }
  );
  // Media móvil exponencial
  static exponentialMovingAverage = ComputationCache.memoize(
    (values: number[], alpha = 0.3): number[] => {
      if (values.length === 0) return [];
      
      const ema = [values[0]];
      
      for (let i = 1; i < values.length; i++) {
        ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
      }
      
      return ema;
    },
    { ttl: 300000 }
  );
  // Detección de outliers con método IQR
  static detectOutliers = ComputationCache.memoize(
    (values: number[]): { outliers: number[]; indices: number[] } => {
      if (values.length < 4) return { outliers: [], indices: [] };
      
      const q1 = this.percentile(values, 25);
      const q3 = this.percentile(values, 75);
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers: number[] = [];
      const indices: number[] = [];
      
      values.forEach((value, index) => {
        if (value < lowerBound || value > upperBound) {
          outliers.push(value);
          indices.push(index);
        }
      });
      
      return { outliers, indices };
    },
    { ttl: 300000 }
  );
  // Normalizar valores entre 0 y 1
  static normalize(values: number[]): number[] {
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return values.map(() => 0.5);
    
    return values.map(val => (val - min) / range);
  }
  // Calcular correlación entre dos arrays
  static correlation = ComputationCache.memoize(
    (x: number[], y: number[]): number => {
      if (x.length !== y.length || x.length < 2) return 0;
      
      const n = x.length;
      const xMean = x.reduce((sum, val) => sum + val, 0) / n;
      const yMean = y.reduce((sum, val) => sum + val, 0) / n;
      
      let numerator = 0;
      let xVariance = 0;
      let yVariance = 0;
      
      for (let i = 0; i < n; i++) {
        const xDiff = x[i] - xMean;
        const yDiff = y[i] - yMean;
        numerator += xDiff * yDiff;
        xVariance += xDiff * xDiff;
        yVariance += yDiff * yDiff;
      }
      
      const denominator = Math.sqrt(xVariance * yVariance);
      return denominator !== 0 ? numerator / denominator : 0;
    },
    { ttl: 600000 }
  );
  // Limpiar cache de matemáticas
  static clearMathCache(): void {
    ComputationCache.invalidateTransactionCache();
    console.log('🧮 Math cache cleared');
  }
}
