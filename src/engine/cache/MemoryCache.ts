interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milliseconds
  accessCount: number;
}
interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}
export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, hitRate: 0 };
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  set<T>(key: string, data: T, ttl = 300000): void { // 5 min default TTL
    // Si cache está lleno, eliminar el menos usado
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0
    });
  }
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    // Incrementar contador de acceso
    entry.accessCount++;
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data as T;
  }
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, hitRate: 0 };
  }
  // Invalidar cache por patrón
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastAccessCount = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastAccessCount) {
        leastAccessCount = entry.accessCount;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.stats.evictions++;
    }
  }
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
  getStats(): CacheStats {
    return { ...this.stats };
  }
  size(): number {
    return this.cache.size;
  }
}
// Singleton para toda la app
export const globalCache = new MemoryCache(500);
