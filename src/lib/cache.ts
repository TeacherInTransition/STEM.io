export class LocalCache {
  private static memoryStore = new Map<string, { value: any; expiry: number }>();

  static set<T>(key: string, value: T, ttlMs: number = 300000): void {
    const expiry = Date.now() + ttlMs;
    this.memoryStore.set(key, { value, expiry });

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(
          `stemio_cache_${key}`,
          JSON.stringify({ value, expiry })
        );
      } catch (e) {
        console.warn("LocalStorage cache write failed", e);
      }
    }
  }

  static get<T>(key: string): T | null {
    const item = this.memoryStore.get(key);
    if (item) {
      if (Date.now() < item.expiry) {
        return item.value as T;
      }
      this.memoryStore.delete(key);
    }

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(`stemio_cache_${key}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Date.now() < parsed.expiry) {
            this.memoryStore.set(key, parsed);
            return parsed.value as T;
          }
          window.localStorage.removeItem(`stemio_cache_${key}`);
        }
      } catch (e) {
        console.warn("LocalStorage cache read failed", e);
      }
    }

    return null;
  }

  static clear(key: string): void {
    this.memoryStore.delete(key);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(`stemio_cache_${key}`);
    }
  }
}
