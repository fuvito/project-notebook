import { useEffect, useState } from 'react';
import { getAllNotebooks } from '../db/repository.ts';

export interface SearchResult {
  notebookId: string;
  notebookTitle: string;
  blockId: string;
  blockType: 'title' | 'heading' | 'paragraph' | 'bullet' | 'link';
  snippet: string;
  matchStart: number;
  matchLength: number;
  occurrenceIndex: number; // Nth block of this type in the doc that contains the query
}

function makeSnippet(text: string, idx: number, qLen: number) {
  const CTX = 40;
  const rawStart = Math.max(0, idx - CTX);
  const rawEnd = Math.min(text.length, idx + qLen + CTX);
  const prefix = rawStart > 0 ? '…' : '';
  const suffix = rawEnd < text.length ? '…' : '';
  return {
    snippet: prefix + text.slice(rawStart, rawEnd) + suffix,
    matchStart: idx - rawStart + prefix.length,
    matchLength: qLen,
  };
}

async function runSearch(query: string): Promise<SearchResult[]> {
  const notebooks = await getAllNotebooks();
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const nb of notebooks) {
    const titleIdx = nb.title.toLowerCase().indexOf(q);
    if (titleIdx !== -1) {
      results.push({
        notebookId: nb.id,
        notebookTitle: nb.title,
        blockId: '__title__',
        blockType: 'title',
        occurrenceIndex: 0,
        ...makeSnippet(nb.title, titleIdx, q.length),
      });
    }

    const typeOcc: Record<string, number> = { heading: 0, paragraph: 0, bullet: 0 };

    for (const block of nb.content.blocks) {
      if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'bullet') {
        const idx = block.text.toLowerCase().indexOf(q);
        if (idx !== -1) {
          results.push({
            notebookId: nb.id,
            notebookTitle: nb.title,
            blockId: block.id,
            blockType: block.type,
            occurrenceIndex: typeOcc[block.type]++,
            ...makeSnippet(block.text, idx, q.length),
          });
        }
      } else if (block.type === 'link') {
        const fields: string[] = [block.title, block.url, block.description ?? ''];
        for (const fieldText of fields) {
          const idx = fieldText.toLowerCase().indexOf(q);
          if (idx !== -1) {
            results.push({
              notebookId: nb.id,
              notebookTitle: nb.title,
              blockId: block.id,
              blockType: 'link',
              occurrenceIndex: 0,
              ...makeSnippet(fieldText, idx, q.length),
            });
            break;
          }
        }
      }
    }
  }

  return results.slice(0, 80);
}

export function useSearch(query: string): { results: SearchResult[]; searching: boolean } {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      runSearch(trimmed)
        .then((r) => {
          setResults(r);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, searching };
}
