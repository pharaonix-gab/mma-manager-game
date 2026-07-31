// localStorage-backed shim for the Bolt window.storage API used by the game.
// The component calls window.storage.get/set/delete with (key, isUserScoped).
// We persist to localStorage so the Hall of Fame and custom rosters survive reloads.

type StorageResult = { value: string } | null;

function scopedKey(key: string, isUserScoped: boolean): string {
  return isUserScoped ? `user:${key}` : `app:${key}`;
}

const storageApi = {
  async get(key: string, isUserScoped = false): Promise<StorageResult> {
    try {
      const raw = localStorage.getItem(scopedKey(key, isUserScoped));
      if (raw === null) return null;
      return { value: raw };
    } catch {
      return null;
    }
  },
  async set(key: string, value: string, isUserScoped = false): Promise<void> {
    try {
      localStorage.setItem(scopedKey(key, isUserScoped), value);
    } catch {
      /* storage full or unavailable — non-blocking */
    }
  },
  async delete(key: string, isUserScoped = false): Promise<void> {
    try {
      localStorage.removeItem(scopedKey(key, isUserScoped));
    } catch {
      /* non-blocking */
    }
  },
};

declare global {
  interface Window {
    storage: typeof storageApi;
  }
}

if (typeof window !== "undefined" && !window.storage) {
  window.storage = storageApi;
}

export {};
