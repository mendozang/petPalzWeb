import { Injectable } from '@angular/core';
import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'petPalzDB';
  private userStoreName = 'users';
  private imageStoreName = 'images';

  constructor() {
    this.initDB().catch(error => console.error('Error initializing IndexedDB:', error));
  }

  private async initDB(): Promise<IDBPDatabase<unknown>> {
    return await openDB(this.dbName, 2, { // Increment version to force upgrade
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'userId' });
        }
      },
    });
  }

  async setUser(user: any): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(this.userStoreName, 'readwrite');
    await tx.store.put(user);
    await tx.done;
  }

  async getUser(): Promise<any> {
    const db = await openDB(this.dbName, 2);
    return await db.transaction(this.userStoreName).store.getAll();
  }

  async deleteUser(): Promise<void> {
    const db = await openDB(this.dbName, 2);
    const tx = db.transaction(this.userStoreName, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }

  async setImage(userId: number, imageUrl: string): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(this.imageStoreName, 'readwrite');
    await tx.store.put({ userId, imageUrl });
    await tx.done;
  }

  async getImage(userId: number): Promise<string | null> {
    const db = await openDB(this.dbName, 2);
    const image = await db.transaction(this.imageStoreName).store.get(userId);
    return image ? image.imageUrl : null;
  }

  async deleteImage(userId: number): Promise<void> {
    const db = await openDB(this.dbName, 2);
    const tx = db.transaction(this.imageStoreName, 'readwrite');
    await tx.store.delete(userId);
    await tx.done;
  }
}