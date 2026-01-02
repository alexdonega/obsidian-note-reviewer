import { openDB, type IDBPDatabase } from 'idb';
import { log } from './logger';
import { supabase } from './supabase';

const DB_NAME = 'obsidian-note-reviewer';
const DB_VERSION = 1;

interface SyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface CachedNote {
  id: string;
  title: string;
  content: string;
  markdown: string;
  org_id: string;
  created_by: string;
  updated_at: string;
  is_synced: boolean;
  local_changes?: any;
}

// IndexedDB manager
class OfflineDB {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Notes store
          if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
            notesStore.createIndex('org_id', 'org_id');
            notesStore.createIndex('updated_at', 'updated_at');
            notesStore.createIndex('is_synced', 'is_synced');
          }

          // Annotations store
          if (!db.objectStoreNames.contains('annotations')) {
            const annotationsStore = db.createObjectStore('annotations', { keyPath: 'id' });
            annotationsStore.createIndex('note_id', 'note_id');
            annotationsStore.createIndex('user_id', 'user_id');
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('sync_queue')) {
            const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            syncStore.createIndex('timestamp', 'timestamp');
            syncStore.createIndex('table', 'table');
          }

          // Metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        },
      });

      log.info('IndexedDB initialized');
    } catch (error) {
      log.error('IndexedDB initialization failed', error);
      throw error;
    }
  }

  async get<T>(store: string, key: string): Promise<T | undefined> {
    if (!this.db) await this.init();
    return this.db!.get(store, key);
  }

  async getAll<T>(store: string, indexName?: string, query?: any): Promise<T[]> {
    if (!this.db) await this.init();

    if (indexName) {
      const index = this.db!.transaction(store).store.index(indexName);
      return index.getAll(query);
    }

    return this.db!.getAll(store);
  }

  async put(store: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put(store, value);
  }

  async delete(store: string, key: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete(store, key);
  }

  async clear(store: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear(store);
  }

  async count(store: string): Promise<number> {
    if (!this.db) await this.init();
    return this.db!.count(store);
  }
}

// Offline sync manager
export class OfflineSyncManager {
  private db = new OfflineDB();
  private syncInProgress = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    await this.db.init();

    // Start periodic sync
    this.startPeriodicSync();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    log.info('Offline sync manager initialized');
  }

  // Save note offline
  async saveNoteOffline(note: any, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      // Save to IndexedDB
      if (operation !== 'delete') {
        await this.db.put('notes', {
          ...note,
          is_synced: false,
          local_changes: { operation, timestamp: Date.now() },
        });
      } else {
        await this.db.delete('notes', note.id);
      }

      // Add to sync queue
      await this.addToSyncQueue({
        id: crypto.randomUUID(),
        operation,
        table: 'notes',
        data: note,
        timestamp: Date.now(),
        retries: 0,
      });

      log.info('Note saved offline', { noteId: note.id, operation });
    } catch (error) {
      log.error('Failed to save note offline', error);
      throw error;
    }
  }

  // Get note from offline storage
  async getNote(noteId: string): Promise<CachedNote | undefined> {
    return this.db.get<CachedNote>('notes', noteId);
  }

  // Get all notes for org
  async getOrgNotes(orgId: string): Promise<CachedNote[]> {
    return this.db.getAll<CachedNote>('notes', 'org_id', orgId);
  }

  // Add to sync queue
  private async addToSyncQueue(item: SyncQueue): Promise<void> {
    await this.db.put('sync_queue', item);
  }

  // Get sync queue
  private async getSyncQueue(): Promise<SyncQueue[]> {
    const queue = await this.db.getAll<SyncQueue>('sync_queue');
    return queue.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Sync with server
  async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      log.debug('Sync skipped', { inProgress: this.syncInProgress, online: navigator.onLine });
      return;
    }

    this.syncInProgress = true;

    try {
      const queue = await this.getSyncQueue();
      log.info('Starting sync', { queueSize: queue.length });

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await this.db.delete('sync_queue', item.id);
        } catch (error) {
          log.error('Sync item failed', error, { item });

          // Retry logic
          if (item.retries < 3) {
            await this.db.put('sync_queue', {
              ...item,
              retries: item.retries + 1,
            });
          } else {
            log.error('Sync item exceeded max retries', { item });
            await this.db.delete('sync_queue', item.id);
          }
        }
      }

      // Download latest data
      await this.downloadLatestData();

      log.info('Sync completed successfully');
    } catch (error) {
      log.error('Sync failed', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync individual item
  private async syncItem(item: SyncQueue): Promise<void> {
    switch (item.operation) {
      case 'create':
        await supabase.from(item.table).insert(item.data);
        break;

      case 'update':
        await supabase.from(item.table).update(item.data).eq('id', item.data.id);
        break;

      case 'delete':
        await supabase.from(item.table).delete().eq('id', item.data.id);
        break;
    }

    // Mark as synced in local storage
    if (item.operation !== 'delete') {
      const localData = await this.db.get(item.table, item.data.id);
      if (localData) {
        await this.db.put(item.table, {
          ...localData,
          is_synced: true,
          local_changes: null,
        });
      }
    }
  }

  // Download latest data from server
  private async downloadLatestData(): Promise<void> {
    try {
      // Get last sync timestamp
      const metadata = await this.db.get<{ key: string; value: number }>('metadata', 'last_sync');
      const lastSync = metadata?.value || 0;

      // Fetch notes updated since last sync
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .gt('updated_at', new Date(lastSync).toISOString())
        .limit(100);

      if (error) throw error;

      // Update local storage
      if (notes) {
        for (const note of notes) {
          await this.db.put('notes', {
            ...note,
            is_synced: true,
          });
        }
      }

      // Update last sync timestamp
      await this.db.put('metadata', {
        key: 'last_sync',
        value: Date.now(),
      });

      log.info('Downloaded latest data', { count: notes?.length || 0 });
    } catch (error) {
      log.error('Failed to download latest data', error);
    }
  }

  // Start periodic sync
  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, 30000);
  }

  // Stop periodic sync
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Handle online event
  private handleOnline(): void {
    log.info('Device is online - starting sync');
    this.sync();
  }

  // Handle offline event
  private handleOffline(): void {
    log.info('Device is offline');
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    pendingItems: number;
    unsyncedNotes: number;
    lastSync: number;
    isOnline: boolean;
  }> {
    const pendingItems = await this.db.count('sync_queue');
    const unsyncedNotes = (await this.db.getAll<CachedNote>('notes', 'is_synced', false)).length;
    const metadata = await this.db.get<{ key: string; value: number }>('metadata', 'last_sync');
    const lastSync = metadata?.value || 0;

    return {
      pendingItems,
      unsyncedNotes,
      lastSync,
      isOnline: navigator.onLine,
    };
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    await this.db.clear('notes');
    await this.db.clear('annotations');
    await this.db.clear('sync_queue');
    await this.db.clear('metadata');

    log.info('Offline data cleared');
  }
}

// Export singleton
export const offlineSync = new OfflineSyncManager();

// Install package: bun add idb
