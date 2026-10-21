import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  _closeDB,
  createNotebook,
  getAllNotebooks,
  getNotebook,
  saveNotebook,
  deleteNotebook,
  getLastUsedNotebookId,
  setLastUsedNotebookId,
} from './repository.ts';
import type { Notebook } from '../types/schema.ts';

// Reset to a fresh IndexedDB before every test so state never leaks.
beforeEach(() => {
  (globalThis as Record<string, unknown>).indexedDB = new IDBFactory();
  _closeDB();
});

// ── createNotebook ────────────────────────────────────────────────────────────

describe('createNotebook', () => {
  it('returns a notebook with the given title', () => {
    const nb = createNotebook('Alpha');
    expect(nb.title).toBe('Alpha');
  });

  it('sets createdAt and updatedAt to the same value', () => {
    const nb = createNotebook('Beta');
    expect(nb.createdAt).toBe(nb.updatedAt);
  });

  it('generates a unique id each call', () => {
    const a = createNotebook('A');
    const b = createNotebook('B');
    expect(a.id).not.toBe(b.id);
  });

  it('starts with an empty block list', () => {
    const nb = createNotebook('C');
    expect(nb.content.blocks).toHaveLength(0);
  });

  it('sets content version to 1', () => {
    const nb = createNotebook('D');
    expect(nb.content.version).toBe(1);
  });
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

function makeNotebook(id: string, title: string, updatedAt = 1000): Notebook {
  return {
    id,
    title,
    createdAt: 1000,
    updatedAt,
    content: { version: 1, blocks: [] },
  };
}

describe('saveNotebook / getNotebook', () => {
  it('saves and retrieves a notebook by id', async () => {
    const nb = makeNotebook('nb-1', 'Alpha');
    await saveNotebook(nb);
    expect(await getNotebook('nb-1')).toEqual(nb);
  });

  it('overwrites an existing notebook on re-save', async () => {
    await saveNotebook(makeNotebook('nb-1', 'Alpha'));
    const updated = makeNotebook('nb-1', 'Alpha Renamed');
    await saveNotebook(updated);
    expect((await getNotebook('nb-1'))?.title).toBe('Alpha Renamed');
  });

  it('returns undefined for a missing id', async () => {
    expect(await getNotebook('nonexistent')).toBeUndefined();
  });
});

describe('getAllNotebooks', () => {
  it('returns an empty array when no notebooks exist', async () => {
    expect(await getAllNotebooks()).toEqual([]);
  });

  it('returns all saved notebooks', async () => {
    await saveNotebook(makeNotebook('nb-a', 'Alpha'));
    await saveNotebook(makeNotebook('nb-b', 'Beta'));
    const all = await getAllNotebooks();
    expect(all).toHaveLength(2);
  });

  it('returns notebooks sorted newest-updated first', async () => {
    await saveNotebook(makeNotebook('nb-old', 'Old', 1000));
    await saveNotebook(makeNotebook('nb-new', 'New', 9000));
    const [first, second] = await getAllNotebooks();
    expect(first!.id).toBe('nb-new');
    expect(second!.id).toBe('nb-old');
  });
});

describe('deleteNotebook', () => {
  it('removes the notebook', async () => {
    await saveNotebook(makeNotebook('nb-del', 'To delete'));
    await deleteNotebook('nb-del');
    expect(await getNotebook('nb-del')).toBeUndefined();
  });

  it('does not affect other notebooks', async () => {
    await saveNotebook(makeNotebook('nb-keep', 'Keep'));
    await saveNotebook(makeNotebook('nb-del', 'Delete'));
    await deleteNotebook('nb-del');
    expect(await getNotebook('nb-keep')).toBeDefined();
  });

  it('is a no-op for a non-existent id', async () => {
    await expect(deleteNotebook('ghost')).resolves.toBeUndefined();
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────

describe('lastUsedNotebookId', () => {
  it('returns null when nothing has been set', async () => {
    expect(await getLastUsedNotebookId()).toBeNull();
  });

  it('stores and retrieves an id', async () => {
    await setLastUsedNotebookId('nb-x');
    expect(await getLastUsedNotebookId()).toBe('nb-x');
  });

  it('overwrites the previous value', async () => {
    await setLastUsedNotebookId('nb-first');
    await setLastUsedNotebookId('nb-second');
    expect(await getLastUsedNotebookId()).toBe('nb-second');
  });
});
