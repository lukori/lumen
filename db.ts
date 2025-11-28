import { Project } from './types';

const DB_NAME = 'LumenDB';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const loadProjects = async (): Promise<Project[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        // Sort by lastEdited descending (newest first)
        const projects = request.result as Project[];
        projects.sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime());
        resolve(projects);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Error loading projects:', e);
    return [];
  }
};

export const saveProject = async (project: Project): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(project);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(projectId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const saveProjects = async (projects: Project[]): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);

        projects.forEach(p => store.put(p));
    });
};