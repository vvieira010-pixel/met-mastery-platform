export class LocalStorageRepository {
  constructor(storageKeyPrefix) {
    this.prefix = storageKeyPrefix;
  }

  async load(studentId) {
    const key = `${this.prefix}:${studentId}`;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async save(studentId, data) {
    const key = `${this.prefix}:${studentId}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }
}
