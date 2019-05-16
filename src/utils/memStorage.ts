export class MemoryStorage<T=any> {
    private data: Record<string, T> = {}

    public setItem (key: string, value: T) {
      this.data[key] = value
    }

    public getItem (key: string) {
      return this.data[key]
    }

    public removeItem (key: string) {
      delete this.data[key]
    }
}

export const memStorage = new MemoryStorage()
