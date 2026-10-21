import { useState, useEffect, useCallback } from 'react';
import {
  getAllNotebooks,
  getNotebook,
  saveNotebook,
  deleteNotebook,
  getLastUsedNotebookId,
  setLastUsedNotebookId,
  createNotebook,
} from '../db/repository.ts';
import type { Notebook } from '../types/schema.ts';

export interface UseNotebooksResult {
  notebooks: Notebook[];
  selectedId: string | null;
  loading: boolean;
  select(id: string): void;
  create(title: string): Promise<void>;
  rename(id: string, newTitle: string): Promise<void>;
  remove(id: string): Promise<void>;
  restore(imported: Notebook[]): Promise<void>;
}

export function useNotebooks(): UseNotebooksResult {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async (): Promise<Notebook[]> => {
    const all = await getAllNotebooks();
    setNotebooks(all);
    return all;
  }, []);

  // Load notebooks and restore last-used selection on mount.
  useEffect(() => {
    let active = true;
    void (async () => {
      const [all, lastId] = await Promise.all([
        getAllNotebooks(),
        getLastUsedNotebookId(),
      ]);
      if (!active) return;
      setNotebooks(all);
      if (lastId !== null && all.some((nb) => nb.id === lastId)) {
        setSelectedId(lastId);
      } else if (all.length > 0) {
        setSelectedId(all[0]?.id ?? null);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    void setLastUsedNotebookId(id).catch(() => {});
  }, []);

  const create = useCallback(async (title: string): Promise<void> => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const nb = createNotebook(trimmed);
    await saveNotebook(nb);
    await reload();
    setSelectedId(nb.id);
    void setLastUsedNotebookId(nb.id).catch(() => {});
  }, [reload]);

  const rename = useCallback(async (id: string, newTitle: string): Promise<void> => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const nb = await getNotebook(id);
    if (!nb) return;
    await saveNotebook({ ...nb, title: trimmed, updatedAt: Date.now() });
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteNotebook(id);
    const all = await reload();
    if (selectedId === id) {
      const next = all[0]?.id ?? null;
      setSelectedId(next);
      if (next) void setLastUsedNotebookId(next).catch(() => {});
    }
  }, [reload, selectedId]);

  const restore = useCallback(async (imported: Notebook[]): Promise<void> => {
    for (const nb of imported) {
      await saveNotebook(nb);
    }
    await reload();
    const firstId = imported[0]?.id;
    if (firstId) {
      setSelectedId(firstId);
      void setLastUsedNotebookId(firstId).catch(() => {});
    }
  }, [reload]);

  return { notebooks, selectedId, loading, select, create, rename, remove, restore };
}
