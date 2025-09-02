
interface WorkerMessage {
  id: string;
  type: string;
  data: any;
}
interface WorkerResponse {
  id: string;
  type: 'SUCCESS' | 'ERROR';
  result?: any;
  error?: string;
}
export class WorkerManager {
  private worker: Worker | null = null;
  private pendingPromises = new Map<string, { resolve: Function; reject: Function }>();
  private messageId = 0;
  constructor() {
    this.initializeWorker();
  }
  private initializeWorker(): void {
    if (typeof window !== 'undefined' && window.Worker) {
      try {
        this.worker = new Worker('/workers/CalculationWorker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        this.worker.onerror = this.handleWorkerError.bind(this);
        console.log('🔧 Financial Worker initialized');
      } catch (error) {
        console.warn('⚠️ Worker not available, falling back to main thread:', error);
      }
    }
  }
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const { id, type, result, error } = event.data;
    const promise = this.pendingPromises.get(id);
    
    if (!promise) return;
    
    this.pendingPromises.delete(id);
    
    if (type === 'SUCCESS') {
      promise.resolve(result);
    } else {
      promise.reject(new Error(error || 'Worker calculation failed'));
    }
  }
  private handleWorkerError(error: ErrorEvent): void {
    console.error('🚨 Worker error:', error);
    
    // Rechazar todas las promesas pendientes
    this.pendingPromises.forEach(({ reject }) => {
      reject(new Error('Worker crashed'));
    });
    this.pendingPromises.clear();
    
    // Intentar reinicializar el worker
    setTimeout(() => this.initializeWorker(), 1000);
  }
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }
  async performCalculation<T>(type: string, data: any): Promise<T> {
    if (!this.worker) {
      throw new Error('Worker not available');
    }
    const id = this.generateMessageId();
    
    return new Promise<T>((resolve, reject) => {
      // Timeout para evitar promesas colgadas
      const timeout = setTimeout(() => {
        this.pendingPromises.delete(id);
        reject(new Error('Worker calculation timeout'));
      }, 30000); // 30 segundos timeout
      
      this.pendingPromises.set(id, {
        resolve: (result: T) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });
      const message: WorkerMessage = { id, type, data };
      this.worker!.postMessage(message);
    });
  }
  // Métodos específicos para cada tipo de cálculo
  async performComplexAnalysis(data: any): Promise<any> {
    return this.performCalculation('COMPLEX_ANALYSIS', data);
  }
  async performTrendAnalysis(data: any): Promise<any> {
    return this.performCalculation('TREND_ANALYSIS', data);
  }
  async calculateRiskMetrics(data: any): Promise<any> {
    return this.performCalculation('RISK_CALCULATION', data);
  }
  async performProjectionAnalysis(data: any): Promise<any> {
    return this.performCalculation('PROJECTION_ANALYSIS', data);
  }
  // Verificar si el worker está disponible
  isWorkerAvailable(): boolean {
    return this.worker !== null;
  }
  // Limpiar recursos
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.pendingPromises.forEach(({ reject }) => {
      reject(new Error('Worker manager destroyed'));
    });
    this.pendingPromises.clear();
  }
  // Obtener estadísticas del worker
  getStats(): { pendingCalculations: number; workerAvailable: boolean } {
    return {
      pendingCalculations: this.pendingPromises.size,
      workerAvailable: this.isWorkerAvailable()
    };
  }
}
// Singleton instance
export const workerManager = new WorkerManager();
// Cleanup al cerrar la página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    workerManager.destroy();
  });
}
