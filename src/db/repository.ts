import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { migrate } from './migrations.ts';
import type { Notebook } from '../types/schema.ts';

// ── DB schema ─────────────────────────────────────────────────────────────────

export interface NotebookDB extends DBSchema {
  notebooks: {
    key: string;
    value: Notebook;
    indexes: { 'by-updatedAt': number };
  };
  settings: {
    key: string;
    value: string;
  };
}

const DB_NAME = 'project-notebook';
const DB_VERSION = 1;

// ── Connection singleton ──────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<NotebookDB>> | null = null;

function getDB(): Promise<IDBPDatabase<NotebookDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NotebookDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        migrate(db, oldVersion);
      },
    });
  }
  return dbPromise;
}

// Reset the singleton. Used in tests to get a fresh DB after replacing
// globalThis.indexedDB with a new IDBFactory instance.
export function _closeDB(): void {
  dbPromise?.then((db) => db.close());
  dbPromise = null;
}

// ── Notebook factory ──────────────────────────────────────────────────────────

export function createNotebook(title: string): Notebook {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    content: { version: 1, blocks: [] },
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

// Returns all notebooks sorted by updatedAt descending (most recently edited first).
export async function getAllNotebooks(): Promise<Notebook[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('notebooks', 'by-updatedAt');
  return all.reverse();
}

export async function getNotebook(id: string): Promise<Notebook | undefined> {
  const db = await getDB();
  return db.get('notebooks', id);
}

export async function saveNotebook(notebook: Notebook): Promise<void> {
  const db = await getDB();
  await db.put('notebooks', notebook);
}

export async function deleteNotebook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notebooks', id);
}

// ── Settings ──────────────────────────────────────────────────────────────────

const LAST_USED_KEY = 'lastUsedNotebookId';

export async function getLastUsedNotebookId(): Promise<string | null> {
  const db = await getDB();
  return (await db.get('settings', LAST_USED_KEY)) ?? null;
}

export async function setLastUsedNotebookId(id: string): Promise<void> {
  const db = await getDB();
  await db.put('settings', id, LAST_USED_KEY);
}
