import { useState, useRef, useEffect } from 'react';
import { useSearch, type SearchResult } from '../hooks/useSearch.ts';

const INDIGO = '#4F46E5';
const SURFACE = '#F9FAFB';
const BORDER = '#E5E7EB';
const TEXT = '#111827';
const TEXT_MUTED = '#6B7280';

const BLOCK_LABEL: Record<SearchResult['blockType'], string> = {
  title: 'Title',
  heading: 'H',
  paragraph: '¶',
  bullet: '•',
  link: '🔗',
};

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '168px',
    minWidth: '168px',
    height: '100%',
    background: SURFACE,
    borderRight: `1px solid ${BORDER}`,
    fontFamily: 'Inter Variable, Inter, sans-serif',
    fontSize: '0.8125rem',
    overflow: 'hidden',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0.5rem 0.5rem 0.375rem',
    flexShrink: 0,
    borderBottom: `1px solid ${BORDER}`,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    padding: '0.2rem 0.3rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: TEXT_MUTED,
    lineHeight: 1,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: '0.8125rem',
    padding: '0.25rem 0.375rem',
    border: `1px solid ${INDIGO}`,
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: 0,
    color: TEXT,
    background: '#fff',
  },
  results: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.25rem 0',
  },
  status: {
    padding: '0.5rem 0.75rem',
    color: TEXT_MUTED,
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  groupHeader: {
    padding: '0.375rem 0.625rem 0.125rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: INDIGO,
    letterSpacing: '0.02em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    borderTop: `1px solid ${BORDER}`,
    marginTop: '0.125rem',
  },
  resultBtn: (active: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    textAlign: 'left' as const,
    background: active ? '#EEF2FF' : 'none',
    border: 'none',
    borderLeft: active ? `2px solid ${INDIGO}` : '2px solid transparent',
    padding: '0.25rem 0.5rem 0.25rem 0.375rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    gap: '1px',
  }),
  resultTypeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  resultTypeLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    color: TEXT_MUTED,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    flexShrink: 0,
  },
  snippetText: {
    fontSize: '0.75rem',
    color: TEXT,
    lineHeight: 1.4,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  } as React.CSSProperties,
};

interface HighlightProps {
  snippet: string;
  matchStart: number;
  matchLength: number;
}

function Highlight({ snippet, matchStart, matchLength }: HighlightProps) {
  if (matchLength === 0) return <span>{snippet}</span>;
  return (
    <span>
      {snippet.slice(0, matchStart)}
      <mark style={{ background: '#FEF08A', color: 'inherit', borderRadius: '2px', padding: '0 1px' }}>
        {snippet.slice(matchStart, matchStart + matchLength)}
      </mark>
      {snippet.slice(matchStart + matchLength)}
    </span>
  );
}

interface SearchPanelProps {
  onClose(): void;
  onSelectResult(notebookId: string, scrollToText?: string): void;
}

export function SearchPanel({ onClose, onSelectResult }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const { results, searching } = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Group results by notebook
  const groups: Array<{ notebookId: string; notebookTitle: string; items: SearchResult[] }> = [];
  for (const r of results) {
    const last = groups[groups.length - 1];
    if (last?.notebookId === r.notebookId) {
      last.items.push(r);
    } else {
      groups.push({ notebookId: r.notebookId, notebookTitle: r.notebookTitle, items: [r] });
    }
  }

  const handleSelect = (r: SearchResult) => {
    const key = `${r.notebookId}/${r.blockId}`;
    setActiveKey(key);
    const scrollTo = r.blockType === 'title' ? undefined : query.trim();
    onSelectResult(r.notebookId, scrollTo);
  };

  return (
    <nav aria-label="Search" style={styles.panel}>
      <div style={styles.searchRow}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={onClose}
          aria-label="Close search"
          title="Close search"
        >
          ←
        </button>
        <input
          ref={inputRef}
          style={styles.input}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveKey(null); }}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
          placeholder="Search…"
          aria-label="Search notebooks"
        />
      </div>

      <div style={styles.results} aria-live="polite">
        {query.trim().length >= 2 && searching && (
          <p style={styles.status}>Searching…</p>
        )}
        {query.trim().length >= 2 && !searching && results.length === 0 && (
          <p style={styles.status}>No results</p>
        )}
        {query.trim().length < 2 && query.length > 0 && (
          <p style={styles.status}>Type at least 2 characters</p>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {groups.map((group) => (
            <li key={group.notebookId}>
              <div style={styles.groupHeader} title={group.notebookTitle}>
                {group.notebookTitle}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {group.items.map((r) => (
                  <li key={`${r.notebookId}/${r.blockId}`}>
                    <button
                      type="button"
                      style={styles.resultBtn(activeKey === `${r.notebookId}/${r.blockId}`)}
                      onClick={() => handleSelect(r)}
                      title={r.snippet}
                    >
                      <div style={styles.resultTypeRow}>
                        <span style={styles.resultTypeLabel}>{BLOCK_LABEL[r.blockType]}</span>
                      </div>
                      <div style={styles.snippetText}>
                        <Highlight
                          snippet={r.snippet}
                          matchStart={r.matchStart}
                          matchLength={r.matchLength}
                        />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
