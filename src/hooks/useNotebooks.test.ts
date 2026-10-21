import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotebooks } from './useNotebooks.ts';
import { _closeDB, saveNotebook } from '../db/repository.ts';
import type { Notebook } from '../types/schema.ts';

beforeEach(() => {
  (globalThis as Record<string, unknown>).indexedDB = new IDBFactory();
  _closeDB();
  vi.restoreAllMocks();
});

function makeNotebook(id: string, title: string, updatedAt = 1000): Notebook {
  return { id, title, createdAt: 1000, updatedAt, content: { version: 1, blocks: [] } };
}

// ── initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('starts loading and resolves with empty list', async () => {
    const { result } = renderHook(() => useNotebooks());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notebooks).toEqual([]);
    expect(result.current.selectedId).toBeNull();
  });

  it('loads pre-existing notebooks and selects the first', async () => {
    await saveNotebook(makeNotebook('nb-a', 'Alpha', 2000));
    await saveNotebook(makeNotebook('nb-b', 'Beta', 1000));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notebooks).toHaveLength(2);
    expect(result.current.selectedId).toBe('nb-a'); // newest first
  });
});

// ── select ────────────────────────────────────────────────────────────────────

describe('select', () => {
  it('updates selectedId', async () => {
    await saveNotebook(makeNotebook('nb-a', 'Alpha', 2000));
    await saveNotebook(makeNotebook('nb-b', 'Beta', 1000));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.select('nb-b'));
    expect(result.current.selectedId).toBe('nb-b');
  });
});

// ── create ────────────────────────────────────────────────────────────────────

describe('create', () => {
  it('adds a notebook and selects it', async () => {
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.create('My Project'));

    expect(result.current.notebooks).toHaveLength(1);
    expect(result.current.notebooks[0]!.title).toBe('My Project');
    expect(result.current.selectedId).toBe(result.current.notebooks[0]!.id);
  });

  it('trims whitespace from the title', async () => {
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.create('  Padded  '));
    expect(result.current.notebooks[0]!.title).toBe('Padded');
  });

  it('is a no-op for a blank title', async () => {
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.create('   '));
    expect(result.current.notebooks).toHaveLength(0);
  });
});

// ── rename ────────────────────────────────────────────────────────────────────

describe('rename', () => {
  it('updates the notebook title', async () => {
    await saveNotebook(makeNotebook('nb-1', 'Old Name'));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.rename('nb-1', 'New Name'));

    const nb = result.current.notebooks.find((n) => n.id === 'nb-1');
    expect(nb?.title).toBe('New Name');
  });

  it('is a no-op for a blank new title', async () => {
    await saveNotebook(makeNotebook('nb-1', 'Old Name'));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.rename('nb-1', '   '));
    expect(result.current.notebooks[0]!.title).toBe('Old Name');
  });

  it('is a no-op for an unknown id', async () => {
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.rename('ghost', 'X'));
    expect(result.current.notebooks).toHaveLength(0);
  });
});

// ── remove ────────────────────────────────────────────────────────────────────

describe('remove', () => {
  it('removes the notebook', async () => {
    await saveNotebook(makeNotebook('nb-1', 'Alpha'));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.remove('nb-1'));
    expect(result.current.notebooks).toHaveLength(0);
  });

  it('selects the next notebook when the selected one is deleted', async () => {
    await saveNotebook(makeNotebook('nb-a', 'Alpha', 2000));
    await saveNotebook(makeNotebook('nb-b', 'Beta', 1000));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // select nb-a (the default), then delete it
    await act(() => result.current.remove('nb-a'));

    expect(result.current.selectedId).toBe('nb-b');
    expect(result.current.notebooks).toHaveLength(1);
  });

  it('sets selectedId to null when the last notebook is deleted', async () => {
    await saveNotebook(makeNotebook('nb-1', 'Only'));
    const { result } = renderHook(() => useNotebooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.select('nb-1'));
    await act(() => result.current.remove('nb-1'));

    expect(result.current.selectedId).toBeNull();
  });
});
