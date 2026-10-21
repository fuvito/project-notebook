import type { IDBPDatabase } from 'idb';
import type { NotebookDB } from './repository.ts';

// ── Migration entry point ─────────────────────────────────────────────────────
// Called from repository.ts openDB upgrade callback.
// Add a new `if (oldVersion < N)` block for each DB_VERSION bump.
//
// Version history:
//   v1 — notebooks store (keyPath: id, index: by-updatedAt) + settings store

export function migrate(
  db: IDBPDatabase<NotebookDB>,
  oldVersion: number,
): void {
  if (oldVersion < 1) {
    const notebookStore = db.createObjectStore('notebooks', { keyPath: 'id' });
    notebookStore.createIndex('by-updatedAt', 'updatedAt');
    db.createObjectStore('settings');
  }
  // v2 example:
  // if (oldVersion < 2) {
  //   db.createObjectStore('...');
  // }
}
