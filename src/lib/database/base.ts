
export class BaseDatabase {
  protected getStorageKey(table: string): string {
    return `crm_store_${table}`;
  }

  protected getFromStorage<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Ошибка при чтении ${table}:`, error);
      return [];
    }
  }

  protected saveToStorage<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Ошибка при сохранении ${table}:`, error);
    }
  }

  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
