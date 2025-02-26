import { Injectable } from '@angular/core';
import { openDB, deleteDB, wrap, unwrap } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'petPalzDB';
  private storeName = 'users';

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    await openDB(this.dbName, 1, {
      upgrade(db) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
    });
  }

  async setUser(user: any): Promise<void> {
    const db = await openDB(this.dbName, 1);
    const tx = db.transaction(this.storeName, 'readwrite');
    await tx.store.put(user);
    await tx.done;
  }

  async getUser(): Promise<any> {
    const db = await openDB(this.dbName, 1);
    return await db.transaction(this.storeName).store.getAll();
  }

  async deleteUser(): Promise<void> {
    const db = await openDB(this.dbName, 1);
    const tx = db.transaction(this.storeName, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }
}