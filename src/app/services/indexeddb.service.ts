import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  user: {
    key: string;
    value: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>('my-database', 1, {
      upgrade(db) {
        db.createObjectStore('user');
      }
    });
  }

  async setUser(user: any): Promise<void> {
    const db = await this.dbPromise;
    await db.put('user', user, 'currentUser');
  }

  async getUser(): Promise<any> {
    const db = await this.dbPromise;
    return await db.get('user', 'currentUser');
  }

  async deleteUser(): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('user', 'currentUser');
  }
}