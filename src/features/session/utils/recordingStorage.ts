/**
 * IndexedDB storage utility for persisting in-browser session screen recording clips.
 * Ensures clips are not lost when the user refreshes or re-enters the room.
 */

const DB_NAME = 'unitime_recordings_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

export interface StoredRecording {
  id: string;
  roomId: string;
  name: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  sizeBytes: number;
  durationSeconds: number;
  createdAt: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('roomId', 'roomId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const saveRecordingToStorage = async (recording: StoredRecording): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(recording);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('Failed to save recording to IndexedDB:', err);
  }
};

export const getRecordingsByRoomFromStorage = async (roomId: string): Promise<StoredRecording[]> => {
  if (!roomId) return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('roomId');
      const req = index.getAll(roomId);

      req.onsuccess = () => {
        const results = (req.result || []) as StoredRecording[];
        results.sort((a, b) => a.createdAt - b.createdAt);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('Failed to read recordings from IndexedDB:', err);
    return [];
  }
};

export const deleteRecordingFromStorage = async (id: string): Promise<void> => {
  if (!id) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('Failed to delete recording from IndexedDB:', err);
  }
};

export const clearRecordingsByRoomFromStorage = async (roomId: string): Promise<void> => {
  if (!roomId) return;
  try {
    const items = await getRecordingsByRoomFromStorage(roomId);
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      items.forEach((item) => store.delete(item.id));

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear room recordings from IndexedDB:', err);
  }
};
